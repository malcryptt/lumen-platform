import type { SocketStream } from '@fastify/websocket';
import type { FastifyRequest } from 'fastify';
import { ChatAgent } from '../agent/chat.js';
import { PrismaClient } from '@prisma/client';

const chatAgent = new ChatAgent();
const prisma = new PrismaClient();

/**
 * WebSocket handler for Copilot chat.
 */
export function handleCopilotChat(connection: SocketStream, req: FastifyRequest) {
    console.log(`[CopilotWS] Client connected: ${req.ip}`);

    connection.socket.on('message', async (message: any) => {
        try {
            const data = JSON.parse(message.toString());

            if (data.type === 'chat:message') {
                const userMessage = data.message;
                const sessionId = data.sessionId; // Session context (optional if not scanning yet)

                let state = { status: "unknown" };
                if (sessionId) {
                    const session = await prisma.deploySession.findUnique({ where: { id: sessionId } });
                    if (session) state = session as any;
                }

                // --- Week 5 logic: Real AI Response ---
                const aiMessage = await chatAgent.chat(userMessage, state);

                const response = {
                    type: 'chat:response',
                    message: aiMessage,
                    timestamp: new Date().toISOString()
                };

                connection.socket.send(JSON.stringify(response));
            }
        } catch (error) {
            console.error("[CopilotWS] Error:", error);
            connection.socket.send(JSON.stringify({ type: 'error', message: 'Failed to process chat message' }));
        }
    });

    connection.socket.on('close', () => {
        console.log(`[CopilotWS] Client disconnected: ${req.ip}`);
    });
}
