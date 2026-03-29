import { PrismaClient, DeployStatus, ServiceStatus } from '@prisma/client';
import { RenderClient } from './render.js';
import { deployEmitter } from './emitter.js';
import { decryptFromStorage } from './secrets.js';
import axios from 'axios';

const prisma = new PrismaClient();

export type DeployJob = {
    sessionId: string;
    userId: string;
    renderApiKey: string;
};

/**
 * Orchestrates multi-service deployments (Section 8.3) and Health Checks (Section 9.6).
 */
export async function executeDeployJob(job: DeployJob): Promise<void> {
    const { sessionId, renderApiKey, userId } = job;
    const session = await prisma.deploySession.findUnique({
        where: { id: sessionId },
        include: { secrets: true }
    });

    if (!session || !session.lumenConfig) return;

    try {
        await prisma.deploySession.update({ where: { id: sessionId }, data: { status: DeployStatus.deploying } });
        await deployEmitter.status(sessionId, DeployStatus.deploying);
        await deployEmitter.log(sessionId, "v2 Deploy Orchestrator mapping config...", "info");

        let blocks: any[] = [];
        try {
            const config = JSON.parse(session.lumenConfig);
            // Support both single deploy object and array (for monorepos)
            blocks = Array.isArray(config.deploy) ? config.deploy : [config.deploy || config];
        } catch {
            await deployEmitter.log(sessionId, "Fail: Config is not valid JSON. Correct it in Editor.", "error");
            throw new Error("Invalid Config JSON");
        }

        const render = new RenderClient(renderApiKey);
        let allSuccess = true;

        // --- Sequential Deployment (Section 8.3) ---
        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            const serviceName = block.name || `lumen-svc-${i}`;
            const root = block.build?.root || './';

            await deployEmitter.log(sessionId, `[${i + 1}/${blocks.length}] Deploying service: ${serviceName}...`, "info");

            // Track individual service status
            const svcStatus = await prisma.deployServiceStatus.create({
                data: {
                    sessionId,
                    serviceName,
                    serviceRoot: root,
                    status: 'deploying',
                    deployOrder: i + 1
                }
            });

            try {
                // Decrypt secrets for this block (Section 7.3)
                const envVars: Record<string, string> = { ...block.env };
                for (const [key, val] of Object.entries(envVars)) {
                    if (val === '$secret') {
                        const sec = session.secrets.find(s => s.keyName === key);
                        if (sec) {
                            envVars[key] = decryptFromStorage(sec.valueEnc, sec.iv);
                        }
                    }
                }

                const renderService = await render.createWebService({
                    name: serviceName,
                    repoUrl: session.repoUrl!,
                    runtime: block.build?.runtime || 'node',
                    buildCommand: block.build?.command || 'npm install',
                    startCommand: block.start?.command || 'npm start',
                    port: block.start?.port || 3000,
                    envVars,
                    plan: block.plan || 'free',
                    region: block.region || 'oregon'
                });

                await prisma.deployServiceStatus.update({
                    where: { id: svcStatus.id },
                    data: { renderServiceId: renderService.id }
                });

                // Poll status
                let live = false;
                for (let poll = 0; poll < 40; poll++) {
                    const statusRes = await render.getServiceStatus(renderService.id);
                    // Check logic for "Live": for simplistic MVP/Mock we look at SUSPENDED
                    if (statusRes.suspended === 'not_suspended' || statusRes.deployId) {
                        live = true;
                        break;
                    }
                    await deployEmitter.log(sessionId, `Polling Render status for ${serviceName} (Attempt ${poll + 1})...`, "info");
                    await new Promise(r => setTimeout(r, 15000));
                }

                if (!live) throw new Error(`Timeout waiting for ${serviceName} to become live`);

                // --- Health Check Logic (Section 9.6) ---
                if (block.start?.health) {
                    const healthUrl = `https://${serviceName}.onrender.com${block.start.health}`;
                    await deployEmitter.log(sessionId, `Running Health Check: ${healthUrl}...`, "info");

                    const delay = (block.plan === 'free') ? 60000 : 30000;
                    await new Promise(r => setTimeout(r, delay));

                    try {
                        await axios.get(healthUrl, { timeout: 10000 });
                        await deployEmitter.log(sessionId, `Health Check PASSED for ${serviceName}.`, "info");
                    } catch (e: any) {
                        await deployEmitter.log(sessionId, `Health Check FAILED for ${serviceName}: ${e.message}`, "error");
                        throw new Error(`Health Check failed: ${e.message}`);
                    }
                }

                await prisma.deployServiceStatus.update({
                    where: { id: svcStatus.id },
                    data: { status: 'live' }
                });

                if (i === 0) { // Update primary URL from first service
                    await prisma.deploySession.update({
                        where: { id: sessionId },
                        data: { renderServiceUrl: `https://${serviceName}.onrender.com` }
                    });
                }

            } catch (err: any) {
                allSuccess = false;
                await prisma.deployServiceStatus.update({
                    where: { id: svcStatus.id },
                    data: { status: 'failed', error: err.message }
                });
                await deployEmitter.log(sessionId, `Service ${serviceName} FAILED: ${err.message}`, "error");
                break; // Sequential fails stops the chain
            }
        }

        if (allSuccess) {
            await prisma.deploySession.update({ where: { id: sessionId }, data: { status: DeployStatus.live } });
            await deployEmitter.status(sessionId, DeployStatus.live);
        } else {
            await prisma.deploySession.update({ where: { id: sessionId }, data: { status: DeployStatus.deploy_failed } });
            await deployEmitter.status(sessionId, DeployStatus.deploy_failed);
        }

    } catch (err: any) {
        await prisma.deploySession.update({ where: { id: sessionId }, data: { status: DeployStatus.deploy_failed } });
        await deployEmitter.status(sessionId, DeployStatus.deploy_failed);
        await deployEmitter.log(sessionId, `Fatal Deployment Error: ${err.message}`, "error");
    }
}
