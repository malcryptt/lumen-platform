import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { SocketStream } from '@fastify/websocket';
import { copilotRoutes } from './routes.js';
import { handleCopilotChat } from './ws/handler.js';

/**
 * Fastify plugin for Lumen Copilot module
 */
export async function copilotPlugin(fastify: FastifyInstance) {
    fastify.register(copilotRoutes, { prefix: '/copilot' });

    // Register WebSocket Route for Copilot
    fastify.get('/copilot/ws', { websocket: true }, (connection: SocketStream, req: FastifyRequest) => {
        handleCopilotChat(connection, req);
    });

    fastify.log.info('Lumen Copilot module registered');
}
