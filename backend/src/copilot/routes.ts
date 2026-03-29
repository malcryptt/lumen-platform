import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PrismaClient, DeployStatus } from '@prisma/client';

import { RepoScanner } from './scanner/scanner.js';
import { ConfigGenerator } from './generator/generator.js';
import { validateLumenConfig, configToText } from './generator/schema.js';
import { executeDeployJob } from './deployer/queue.js';
import { encryptForStorage, decryptFromStorage } from './deployer/secrets.js';
import { acquireSlot, releaseSlot, getQuotaStatus } from '../middleware/rateLimit.js';
import { runGeminiWithFallback } from './agent/fallback.js';
import { config as appConfig } from '../config.js';
import { validateGitUrl } from './security/ssrf.js';
import { sanitizeSecretKey } from './security/sanitize.js';

const prisma = new PrismaClient();
const scanner = new RepoScanner();
const generator = new ConfigGenerator();

const ScanSchema = z.object({
    repoUrl: z.string().url(),
    isPrivate: z.boolean().optional().default(false),
});

const SecretSchema = z.object({
    keyName: z.string().min(1),
    value: z.string().min(1),
});

/** Gets user from request (attached by auth middleware) */
function getUser(request: FastifyRequest): { id: string; username: string } {
    return (request as any).user;
}

export async function copilotRoutes(fastify: FastifyInstance) {

    // ─── POST /copilot/scan ─────────────────────────────────────────────
    fastify.post('/scan', async (request: FastifyRequest, reply: FastifyReply) => {
        const parseResult = ScanSchema.safeParse(request.body);
        if (!parseResult.success) {
            return reply.code(400).send({ error: 'Invalid request', details: parseResult.error.issues });
        }

        const user = getUser(request);
        const { repoUrl, isPrivate } = parseResult.data;

        if (!validateGitUrl(repoUrl)) {
            return reply.code(400).send({ error: 'Invalid repository URL. Must be a valid GitHub or GitLab repository.' });
        }

        // Rate limit check
        const rl = acquireSlot(user.id);
        if (!rl.allowed) {
            return reply.code(429).send({ error: 'rate_limited', message: rl.reason, waitMs: rl.waitMs });
        }

        const session = await prisma.deploySession.create({
            data: { userId: user.id, repoUrl, repoPrivate: isPrivate, status: DeployStatus.scanning }
        });

        // Run scan + config generation asynchronously, return session ID immediately
        setImmediate(async () => {
            try {
                const scanResult = await scanner.scan(repoUrl);
                const lumenConfig = await generator.generate(scanResult);

                await prisma.deploySession.update({
                    where: { id: session.id },
                    data: { status: DeployStatus.config_ready, scanResult: scanResult as any, lumenConfig }
                });

                await prisma.deployLog.create({
                    data: { sessionId: session.id, line: `Scan complete. Detected: ${(scanResult as any).runtime}`, level: 'info' }
                });
            } catch (err: any) {
                await prisma.deploySession.update({
                    where: { id: session.id },
                    data: { status: DeployStatus.scan_failed }
                });
                await prisma.deployLog.create({
                    data: { sessionId: session.id, line: `Scan failed: ${err.message}`, level: 'error' }
                });
            } finally {
                releaseSlot(user.id);
            }
        });

        return reply.code(202).send({
            sessionId: session.id,
            status: 'scanning',
            message: 'Repository scan started. Poll /copilot/session/:id for status.'
        });
    });

    // ─── GET /copilot/sessions ──────────────────────────────────────────
    fastify.get('/sessions', async (request: FastifyRequest) => {
        const user = getUser(request);
        const sessions = await prisma.deploySession.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            select: { id: true, repoUrl: true, status: true, createdAt: true, renderServiceUrl: true }
        });
        return { sessions };
    });

    // ─── GET /copilot/session/:id ────────────────────────────────────────
    fastify.get('/session/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const user = getUser(request);

        const session = await prisma.deploySession.findUnique({
            where: { id },
            include: {
                logs: { orderBy: { timestamp: 'desc' }, take: 50 },
                serviceStatuses: { orderBy: { deployOrder: 'asc' } }
            }
        });

        if (!session) return reply.code(404).send({ error: 'Session not found' });
        if (session.userId !== user.id) return reply.code(403).send({ error: 'Forbidden' });

        return session;
    });

    // ─── DELETE /copilot/session/:id ─────────────────────────────────────
    fastify.delete('/session/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const user = getUser(request);

        const session = await prisma.deploySession.findUnique({ where: { id } });
        if (!session) return reply.code(404).send({ error: 'Session not found' });
        if (session.userId !== user.id) return reply.code(403).send({ error: 'Forbidden' });

        await prisma.deploySession.delete({ where: { id } });
        return { deleted: true, id };
    });

    // ─── GET /copilot/config/:id ──────────────────────────────────────────
    fastify.get('/config/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const session = await prisma.deploySession.findUnique({ where: { id } });
        if (!session) return reply.code(404).send({ error: 'Session not found' });

        const configObj = session.lumenConfig ? (() => {
            try { return JSON.parse(session.lumenConfig!); } catch { return null; }
        })() : null;

        const history = await prisma.deployConfigHistory.findMany({
            where: { sessionId: id },
            orderBy: { version: 'desc' },
            select: { version: true, source: true, createdAt: true }
        });

        return {
            id: session.id,
            lumenConfig: session.lumenConfig,
            configText: configObj ? configToText(configObj) : session.lumenConfig,
            status: session.status,
            validation: configObj ? validateLumenConfig(configObj) : null,
            history
        };
    });

    // ─── PUT /copilot/config/:id ──────────────────────────────────────────
    fastify.put('/config/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const user = getUser(request);
        const { lumenConfig, rollback_to_version } = request.body as { lumenConfig?: string, rollback_to_version?: number };

        const session = await prisma.deploySession.findUnique({ where: { id } });
        if (!session) return reply.code(404).send({ error: 'Session not found' });
        if (session.userId !== user.id) return reply.code(403).send({ error: 'Forbidden' });

        if (session.status === DeployStatus.deploying) {
            return reply.code(409).send({ error: 'Cannot update or roll back config while a deploy is in progress' });
        }

        let finalConfig = lumenConfig;

        if (rollback_to_version) {
            const historyItem = await prisma.deployConfigHistory.findFirst({
                where: { sessionId: id, version: rollback_to_version }
            });
            if (!historyItem) return reply.code(404).send({ error: 'History version not found' });
            finalConfig = historyItem.configText;
        }

        if (!finalConfig) return reply.code(400).send({ error: 'lumenConfig or rollback_to_version is required' });

        const updated = await prisma.deploySession.update({
            where: { id },
            data: { lumenConfig: finalConfig, status: DeployStatus.config_ready }
        });

        // Track History
        const currentCount = await prisma.deployConfigHistory.count({ where: { sessionId: id } });
        await prisma.deployConfigHistory.create({
            data: {
                sessionId: id,
                version: currentCount + 1,
                configText: finalConfig,
                source: rollback_to_version ? 'rollback' : 'user_edit'
            }
        });

        return { id: updated.id, lumenConfig: updated.lumenConfig, message: 'Config updated.' };
    });

    // ─── PUT /copilot/session/:id/scan-overrides ──────────────────────────
    fastify.put('/session/:id/scan-overrides', async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const user = getUser(request);
        const overrides = request.body as any;

        const session = await prisma.deploySession.findUnique({ where: { id } });
        if (!session) return reply.code(404).send({ error: 'Session not found' });
        if (session.userId !== user.id) return reply.code(403).send({ error: 'Forbidden' });

        const newResult = { ...(session.scanResult as object || {}), ...overrides };

        const updated = await prisma.deploySession.update({
            where: { id },
            data: { scanResult: newResult }
        });

        return { id: updated.id, message: 'Scan result overridden successfully' };
    });

    // ─── POST /copilot/deploy/:id ─────────────────────────────────────────
    fastify.post('/deploy/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const user = getUser(request);
        const dryRun = (request.query as any)?.dryRun === 'true';

        const session = await prisma.deploySession.findUnique({ where: { id } });
        if (!session) return reply.code(404).send({ error: 'Session not found' });
        if (session.userId !== user.id) return reply.code(403).send({ error: 'Forbidden' });
        if (!session.lumenConfig) return reply.code(400).send({ error: 'No config generated yet. Run scan first.' });

        if (dryRun) {
            const configObj = JSON.parse(session.lumenConfig);
            const validation = validateLumenConfig(configObj);
            return { dryRun: true, valid: validation.valid, errors: validation.errors };
        }

        // Get render key from user integrations
        const integration = await prisma.userIntegration.findUnique({ where: { userId: user.id } });
        let renderApiKey = process.env.RENDER_API_KEY || '';

        if (integration?.renderKeyEnc && integration.renderKeyIv) {
            try {
                renderApiKey = decryptFromStorage(integration.renderKeyEnc, integration.renderKeyIv);
            } catch { /* use env fallback */ }
        }

        // Fire-and-forget deploy job
        executeDeployJob({ sessionId: id, userId: user.id, renderApiKey }).catch(err => {
            fastify.log.error('Deploy job error:', err);
        });

        return reply.code(202).send({ sessionId: id, status: 'deploying', message: 'Deployment started.' });
    });

    // ─── POST /copilot/deploy/:id/cancel ─────────────────────────────────
    fastify.post('/deploy/:id/cancel', async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const user = getUser(request);

        const session = await prisma.deploySession.findUnique({ where: { id } });
        if (!session) return reply.code(404).send({ error: 'Session not found' });
        if (session.userId !== user.id) return reply.code(403).send({ error: 'Forbidden' });

        await prisma.deploySession.update({
            where: { id },
            data: { status: DeployStatus.deploy_failed }
        });

        return { sessionId: id, message: 'Deployment cancelled.' };
    });

    // ─── POST /copilot/diagnose/:id ───────────────────────────────────────
    fastify.post('/diagnose/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const user = getUser(request);

        const rl = acquireSlot(user.id);
        if (!rl.allowed) {
            return reply.code(429).send({ error: 'rate_limited', message: rl.reason, waitMs: rl.waitMs });
        }

        const session = await prisma.deploySession.findUnique({
            where: { id },
            include: { logs: { orderBy: { timestamp: 'desc' }, take: 20 } }
        });
        if (!session) { releaseSlot(user.id); return reply.code(404).send({ error: 'Session not found' }); }

        await prisma.deploySession.update({ where: { id }, data: { status: DeployStatus.diagnosing } });

        const logsText = session.logs.map(l => `[${l.level}] ${l.line}`).join('\n');
        const prompt = `You are a deployment debugging expert.

Current .lumen config:
\`\`\`
${session.lumenConfig}
\`\`\`

Recent deploy logs:
\`\`\`
${logsText || 'No logs available'}
\`\`\`

Diagnose the deployment failure. Identify the root cause, explain it clearly, 
and suggest a specific fix as a config diff or code change. 
Be concise and actionable. Format your response as:
1. ROOT CAUSE: ...
2. EXPLANATION: ...
3. SUGGESTED FIX: (include corrected config section if applicable)`;

        try {
            const diagnosis = await runGeminiWithFallback(appConfig.GEMINI_API_KEY || "", prompt);
            await prisma.deploySession.update({
                where: { id },
                data: { status: DeployStatus.config_ready, diagnosis }
            });
            releaseSlot(user.id);
            return { sessionId: id, diagnosis };
        } catch (err: any) {
            await prisma.deploySession.update({ where: { id }, data: { status: DeployStatus.deploy_failed } });
            releaseSlot(user.id);
            return reply.code(500).send({ error: 'Diagnosis failed', details: err.message });
        }
    });

    // ─── GET /copilot/logs/:id ────────────────────────────────────────────
    fastify.get('/logs/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const { page = '1', limit = '50' } = request.query as Record<string, string>;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const logs = await prisma.deployLog.findMany({
            where: { sessionId: id },
            orderBy: { timestamp: 'asc' },
            skip: (pageNum - 1) * limitNum,
            take: limitNum
        });

        return { sessionId: id, page: pageNum, logs };
    });

    // ─── POST /copilot/secrets/:id ────────────────────────────────────────
    fastify.post('/secrets/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const user = getUser(request);

        const parseResult = SecretSchema.safeParse(request.body);
        if (!parseResult.success) {
            return reply.code(400).send({ error: 'Invalid secret', details: parseResult.error.issues });
        }

        const session = await prisma.deploySession.findUnique({ where: { id } });
        if (!session) return reply.code(404).send({ error: 'Session not found' });
        if (session.userId !== user.id) return reply.code(403).send({ error: 'Forbidden' });

        let keyName, value;
        try {
            keyName = sanitizeSecretKey(parseResult.data.keyName);
            value = parseResult.data.value;
        } catch (err: any) {
            return reply.code(400).send({ error: err.message });
        }

        const encrypted = encryptForStorage(value);

        await prisma.deploySecret.upsert({
            where: { sessionId_keyName: { sessionId: id, keyName } },
            create: { sessionId: id, keyName, valueEnc: encrypted.valueEnc, iv: encrypted.iv },
            update: { valueEnc: encrypted.valueEnc, iv: encrypted.iv }
        });

        return { keyName, stored: true, message: 'Secret encrypted and stored.' };
    });

    // ─── DELETE /copilot/secrets/:id/:key ────────────────────────────────
    fastify.delete('/secrets/:id/:key', async (request: FastifyRequest, reply: FastifyReply) => {
        const { id, key } = request.params as { id: string; key: string };
        const user = getUser(request);

        const session = await prisma.deploySession.findUnique({ where: { id } });
        if (!session) return reply.code(404).send({ error: 'Session not found' });
        if (session.userId !== user.id) return reply.code(403).send({ error: 'Forbidden' });

        await prisma.deploySecret.delete({
            where: { sessionId_keyName: { sessionId: id, keyName: key } }
        });

        return { deleted: true, keyName: key };
    });

    // ─── GET /copilot/integrations ────────────────────────────────────────
    fastify.get('/integrations', async (request: FastifyRequest) => {
        const user = getUser(request);
        const integration = await prisma.userIntegration.findUnique({ where: { userId: user.id } });

        return {
            hasRenderKey: !!integration?.renderKeyEnc,
            hasGithubToken: !!integration?.githubTokenEnc,
            githubLogin: integration ? "Connected User" : null // Simulating connected state
        };
    });

    // ─── PUT /copilot/integrations ───────────────────────────────────────────
    fastify.put('/integrations', async (request: FastifyRequest, reply: FastifyReply) => {
        const user = getUser(request);
        const { renderApiKey, githubToken } = request.body as { renderApiKey?: string, githubToken?: string };

        let updateData: any = {};

        if (renderApiKey) {
            const encrypted = encryptForStorage(renderApiKey);
            updateData.renderKeyEnc = encrypted.valueEnc;
            updateData.renderKeyIv = encrypted.iv;
        }

        if (githubToken) {
            const encrypted = encryptForStorage(githubToken);
            updateData.githubTokenEnc = encrypted.valueEnc;
            updateData.githubTokenIv = encrypted.iv;
        }

        if (Object.keys(updateData).length > 0) {
            await prisma.userIntegration.upsert({
                where: { userId: user.id },
                create: { userId: user.id, ...updateData },
                update: updateData
            });
        }

        return { success: true, message: 'Integrations updated.' };
    });

    // ─── DELETE /copilot/integrations/github ──────────────────────────────
    fastify.delete('/integrations/github', async (request: FastifyRequest) => {
        const user = getUser(request);
        await prisma.userIntegration.update({
            where: { userId: user.id },
            data: { githubTokenEnc: null, githubTokenIv: null }
        });
        return { success: true, message: 'GitHub disconnected.' };
    });

    // ─── GET /copilot/quota ───────────────────────────────────────────────
    fastify.get('/quota', async (request: FastifyRequest) => {
        const user = getUser(request);
        return getQuotaStatus(user.id);
    });
}
