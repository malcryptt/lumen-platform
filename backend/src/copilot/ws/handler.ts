import type { SocketStream } from '@fastify/websocket';
import type { FastifyRequest } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { deployEmitter } from '../deployer/emitter.js';
import { ChatAgent } from '../agent/chat.js';
import { buildChatContext } from '../agent/context.js';

const chatAgent = new ChatAgent();
const prisma = new PrismaClient();

/**
 * WebSocket handler for Copilot state and chat.
 * Implements Section 2.5 (Subscribing) and 2.6 (Replay Missed Events) and 11.3 (Chat Persistence).
 */
export function handleCopilotChat(connection: SocketStream, req: FastifyRequest) {
    const user = (req as any).user;
    const sessionListeners: Set<string> = new Set();

    console.log(`[CopilotWS] Client connected: ${user.id} (${req.ip})`);

    connection.socket.on('message', async (message: any) => {
        try {
            const data = JSON.parse(message.toString());

            // --- 1. Subscription Logic (Section 2.5/2.6) ---
            if (data.event === 'deploy:subscribe') {
                const { session_id, last_event_id } = data;

                // Security check
                const session = await prisma.deploySession.findUnique({ where: { id: session_id } });
                if (!session || session.userId !== user.id) return;

                // Replay missed events (Section 2.6)
                if (last_event_id !== undefined) {
                    const missedEvents = await prisma.deployEvent.findMany({
                        where: {
                            sessionId: session_id,
                            id: { gt: BigInt(last_event_id) }
                        },
                        orderBy: { id: 'asc' }
                    });

                    for (const ev of missedEvents) {
                        connection.socket.send(JSON.stringify({
                            event: ev.eventType,
                            id: ev.id.toString(),
                            payload: ev.payload,
                            replayed: true
                        }));
                    }
                }

                // Attach fresh listener
                const statusListener = (payload: any) => {
                    connection.socket.send(JSON.stringify({ event: 'deploy:progress', payload }));
                };
                const logListener = (payload: any) => {
                    connection.socket.send(JSON.stringify({ event: 'deploy:log', payload }));
                };

                deployEmitter.on(`status:${session_id}`, statusListener);
                deployEmitter.on(`log:${session_id}`, logListener);

                // Track cleanup
                sessionListeners.add(session_id);

                connection.socket.on('close', () => {
                    deployEmitter.off(`status:${session_id}`, statusListener);
                    deployEmitter.off(`log:${session_id}`, logListener);
                });
            }

            // --- 2. Chat Logic (Section 11) ---
            if (data.event === 'chat:message') {
                const { session_id, content } = data;

                // Persist user message (Section 11.3)
                await prisma.chatMessage.create({
                    data: {
                        sessionId: session_id,
                        role: 'user',
                        content: content
                    }
                });

                // Fetch full history and build context with truncation (Section 11.2)
                const historyRaw = await prisma.chatMessage.findMany({
                    where: { sessionId: session_id },
                    orderBy: { createdAt: 'asc' },
                    take: 20
                });

                const history = historyRaw.map(h => ({ role: h.role as 'user' | 'assistant', content: h.content }));
                const { systemPrompt, history: truncatedHistory } = await buildChatContext(session_id, history);

                // Week 5 logic: Send to agent
                // Note: For now we use the chatAgent's simpler interface,
                // but building towards streaming response of Section 11.4/13.10
                const aiResponse = await chatAgent.chat(content, { status: "unknown" }); // Simplified fallback

                // Persist AI response
                await prisma.chatMessage.create({
                    data: {
                        sessionId: session_id,
                        role: 'assistant',
                        content: aiResponse
                    }
                });

                connection.socket.send(JSON.stringify({
                    event: 'chat:response',
                    content: aiResponse,
                    timestamp: new Date().toISOString()
                }));
            }
        } catch (error) {
            console.error("[CopilotWS] Error:", error);
        }
    });

    connection.socket.on('close', () => {
        console.log(`[CopilotWS] Client disconnected: ${user.id}`);
    });
}
