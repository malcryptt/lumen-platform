import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PrismaClient, DeployStatus } from '@prisma/client';

import { RepoScanner } from './scanner/scanner.js';
import { ConfigGenerator } from './generator/generator.js';

const prisma = new PrismaClient();
const scanner = new RepoScanner();
const generator = new ConfigGenerator();

const ScanSchema = z.object({
    repoUrl: z.string().url(),
});

/**
 * Routes for Lumen Copilot module
 */
export async function copilotRoutes(fastify: FastifyInstance) {
    // --- POST /copilot/scan ---
    fastify.post('/scan', async (request: FastifyRequest, reply: FastifyReply) => {
        const result = ScanSchema.safeParse(request.body);
        if (!result.success) {
            return reply.code(400).send({ error: 'Invalid repository URL', details: result.error });
        }

        const { repoUrl } = result.data;

        // Mocked auth userId
        const userId = "d007c58c-6e65-4f35-97b5-202d6b2c6e1e";

        try {
            // Initiate scan session
            const session = await prisma.deploySession.create({
                data: {
                    userId,
                    repoUrl,
                    status: DeployStatus.scanning,
                }
            });

            // 1. Scan the repo
            const scanResult = await scanner.scan(repoUrl);

            // 2. Generate .lumen config
            const lumenConfig = await generator.generate(scanResult);

            await prisma.deploySession.update({
                where: { id: session.id },
                data: {
                    status: DeployStatus.config_ready,
                    scanResult: scanResult as any,
                    lumenConfig: lumenConfig
                }
            });

            return {
                sessionId: session.id,
                status: DeployStatus.config_ready,
                scanResult,
                lumenConfig,
                message: "Repository scanned and config generated successfully."
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({ error: 'Failed to scan repository.', details: (error as Error).message });
        }
    });

    // --- GET /copilot/config/:id ---
    fastify.get('/config/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const session = await prisma.deploySession.findUnique({
            where: { id }
        });

        if (!session) return reply.code(404).send({ error: 'Session not found.' });
        return {
            id: session.id,
            lumenConfig: session.lumenConfig || '# No config generated yet',
            status: session.status
        };
    });

    // --- PUT /copilot/config/:id ---
    fastify.put('/config/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const { lumenConfig } = request.body as { lumenConfig: string };

        try {
            const session = await prisma.deploySession.update({
                where: { id },
                data: { lumenConfig }
            });
            return {
                id: session.id,
                lumenConfig: session.lumenConfig,
                message: "Config updated successfully."
            };
        } catch (error) {
            return reply.code(500).send({ error: "Failed to update config." });
        }
    });

    // --- POST /copilot/deploy/:id ---
    fastify.post('/deploy/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        // Trigger deploy (Week 4 logic)
        return { sessionId: id, status: "deploying", message: "Deployment started (Mock for Week 1)." };
    });

    // --- GET /copilot/status/:id ---
    fastify.get('/status/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const session = await prisma.deploySession.findUnique({
            where: { id }
        });
        if (!session) return reply.code(404).send({ error: "Session not found." });
        return { id: session.id, status: session.status };
    });
}
