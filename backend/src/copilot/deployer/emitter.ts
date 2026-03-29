import { EventEmitter } from 'node:events';

/**
 * Global Deployment Emitter for real-time log streaming across WebSocket connections.
 */
class DeployEmitter extends EventEmitter {
    /**
     * Emit a log line to all listeners for a specific session.
     */
    log(sessionId: string, line: string, level: 'info' | 'warn' | 'error' = 'info') {
        const payload = { sessionId, line, level, timestamp: new Date().toISOString() };
        this.emit(`log:${sessionId}`, payload);
    }

    /**
     * Emit a status change to all listeners.
     */
    status(sessionId: string, status: string, url?: string) {
        this.emit(`status:${sessionId}`, { sessionId, status, url, timestamp: new Date().toISOString() });
    }
}

export const deployEmitter = new DeployEmitter();
