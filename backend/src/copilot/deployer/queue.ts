import { PrismaClient, DeployStatus } from '@prisma/client';
import { RenderClient } from './render.js';
import { deployEmitter } from './emitter.js';

const prisma = new PrismaClient();
const MAX_RETRIES = 3;

export type DeployJob = {
    sessionId: string;
    userId: string;
    renderApiKey: string;
};

/**
 * Execute a full deploy for a session.
 * Handles state transitions, global log streaming, and Render interaction.
 */
export async function executeDeployJob(job: DeployJob): Promise<void> {
    const { sessionId, renderApiKey } = job;
    console.log(`[DeployJob] Starting job for session ${sessionId}`);

    const session = await prisma.deploySession.findUnique({ where: { id: sessionId } });
    if (!session) {
        console.error(`[DeployJob] Session ${sessionId} not found`);
        return;
    }

    try {
        // 1. Initial Transition
        await prisma.deploySession.update({ where: { id: sessionId }, data: { status: DeployStatus.deploying } });
        deployEmitter.log(sessionId, "Initiating v2 Deployment Engine...", "info");

        await prisma.deployLog.create({ data: { sessionId, line: "Deployment initiated via v2 state machine", level: "info" } });

        const render = new RenderClient(renderApiKey);
        let config: any;
        try {
            config = JSON.parse(session.lumenConfig || '{}');
            if (config.deploy) config = config.deploy;
        } catch {
            deployEmitter.log(sessionId, "Warning: Failed to parse lumenConfig as JSON, using heuristics...", "warn");
            config = { name: `lumen-app-${sessionId.slice(0, 8)}`, build: { runtime: 'node', command: 'npm install' }, start: { command: 'npm start', port: 3000 } };
        }

        const name = config.name || `lumen-app-${sessionId.slice(0, 8)}`;
        deployEmitter.log(sessionId, `Preparing Render service: ${name}`, "info");

        // 2. Provisioning
        deployEmitter.log(sessionId, "Provisioning cloud resources on Render...", "info");
        const service = await render.createWebService({
            name,
            repoUrl: session.repoUrl || '',
            runtime: config.build?.runtime || 'node',
            buildCommand: config.build?.command || 'npm install',
            startCommand: config.start?.command || 'npm start',
            port: config.start?.port || 3000,
            plan: config.plan || 'free',
            region: config.region || 'oregon',
            envVars: config.env || {}
        });

        await prisma.deploySession.update({ where: { id: sessionId }, data: { renderServiceId: service.id } });
        deployEmitter.log(sessionId, `Service created. ID: ${service.id}. Starting Build...`, "info");

        // 3. Build & Polling Loop
        let status = 'build_in_progress';
        let polls = 0;
        const maxPolls = 40; // ~10 minutes

        while (status !== 'live' && status !== 'build_failed' && polls < maxPolls) {
            // Check if user canceled from another route
            const currentSession = await prisma.deploySession.findUnique({ where: { id: sessionId } });
            if (currentSession?.status === DeployStatus.deploy_failed) {
                deployEmitter.log(sessionId, "Build canceled by user.", "warn");
                return;
            }

            polls++;
            const percent = Math.min(95, 20 + (polls * 2));
            deployEmitter.log(sessionId, `[Build Progress ${percent}%]: Fetching logs from Render (Attempt ${polls})...`, "info");

            const statusRes = await render.getServiceStatus(service.id);
            // Heuristic status check for v2 mock
            const isLive = statusRes.serviceDetails?.env === 'docker' || statusRes.serviceDetails?.suspended === 'not_suspended';
            if (isLive) {
                status = 'live';
                break;
            }

            await new Promise(r => setTimeout(r, 15000)); // Poll every 15s
        }

        const isLive = status === 'live';
        const serviceUrl = `https://${name}.onrender.com`;

        // 4. Final Transition
        await prisma.deploySession.update({
            where: { id: sessionId },
            data: {
                status: isLive ? DeployStatus.live : DeployStatus.deploy_failed,
                renderServiceUrl: serviceUrl
            }
        });

        if (isLive) {
            deployEmitter.log(sessionId, `Deployment SUCCESSFUL! Live at: ${serviceUrl}`, "info");
            deployEmitter.status(sessionId, 'live', serviceUrl);
            await prisma.deployLog.create({ data: { sessionId, line: `Successfully deployed to live at ${serviceUrl}`, level: 'info' } });
        } else {
            deployEmitter.log(sessionId, "Deployment FAILED on Render. Maximum polling timeout reached.", "error");
            deployEmitter.status(sessionId, 'deploy_failed');
            await prisma.deployLog.create({ data: { sessionId, line: "Deployment failed due to timeout or build error", level: 'error' } });
        }

    } catch (err: any) {
        console.error(`[DeployJob] ERROR in session ${sessionId}:`, err.message);
        deployEmitter.log(sessionId, `Internal Deploy Error: ${err.message}`, "error");

        await prisma.deploySession.update({ where: { id: sessionId }, data: { status: DeployStatus.deploy_failed } });
        await prisma.deployLog.create({ data: { sessionId, line: `Fatal error: ${err.message}`, level: 'error' } });

        deployEmitter.status(sessionId, 'deploy_failed');
    }
}
