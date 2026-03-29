import { EventEmitter } from 'node:events';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Global Deployment Emitter for real-time log streaming across WebSocket connections.
 * Persistent: Stores all events in the deploy_events table for 24h as per Section 2.6.
 */
class DeployEmitter extends EventEmitter {
    /**
     * Emit a log line to all listeners for a specific session.
     */
    async log(sessionId: string, line: string, level: 'info' | 'warn' | 'error' = 'info') {
        const payload = { line, level, timestamp: new Date().toISOString() };

        // Persist
        await prisma.deployEvent.create({
            data: {
                sessionId,
                eventType: 'deploy:log',
                payload: payload as any
            }
        });

        this.emit(`log:${sessionId}`, { sessionId, ...payload });
    }

    /**
     * Emit a status change to all listeners.
     */
    async status(sessionId: string, status: string, url?: string) {
        const payload = { status, url, timestamp: new Date().toISOString() };

        // Persist
        await prisma.deployEvent.create({
            data: {
                sessionId,
                eventType: 'deploy:progress',
                payload: payload as any
            }
        });

        this.emit(`status:${sessionId}`, { sessionId, ...payload });
    }
}

export const deployEmitter = new DeployEmitter();
