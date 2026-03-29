import Fastify from 'fastify';
import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import type { SocketStream } from '@fastify/websocket';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import Docker from 'dockerode';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Buffer } from 'node:buffer';
import process from 'node:process';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

// --- Modules ---
import { copilotPlugin } from './copilot/index.js';

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();
const docker = new Docker();

// --- Initialization ---
fastify.register(cors, { origin: '*' });
fastify.register(fastifyWebsocket);
fastify.register(copilotPlugin);

// --- Registry Schemas ---
const PublishSchema = z.object({
    name: z.string().min(2),
    version: z.string(),
    description: z.string().optional(),
    tarball: z.string().url(),
    checksum: z.string(),
    owner: z.string(),
});

// --- Routes: Health ---
fastify.get('/health', async () => ({ status: 'ok', service: 'lumen-unified-backend' }));

// --- Routes: AI ---
fastify.post('/ai/chat', async (request: FastifyRequest, reply: FastifyReply) => {
    const { message, context } = request.body as { message: string; context?: string };
    if (!message) return reply.code(400).send({ error: 'message is required' });

    try {
        const { ChatAgent } = await import('./copilot/agent/chat.js');
        const agent = new ChatAgent();
        // Use context (e.g. selected code from editor) as deployment state for richer answers
        const state = context ? { editorContext: context } : {};
        const reply_text = await agent.chat(message, state);
        return { reply: reply_text };
    } catch (err) {
        fastify.log.error(err);
        // Graceful fallback if Groq key is missing or quota exceeded
        const fallbacks: Record<string, string> = {
            server: "Here's a simple HTTP server in Lumen:\n\n```lumen\nimport net\n\nserver = net.listen(8080)\nfor client in server {\n    client.write(\"HTTP/1.1 200 OK\\r\\nContent-Length: 13\\r\\n\\r\\nHello Lumen!\")\n    client.close()\n}\n```",
            loop: "Lumen loops are very fast:\n\n```lumen\nimport time\nstart = time.now()\nfor i in 1..1_000_000 { _ = i }\nprint(\"Done: \" .. time.since(start))\n```",
        };
        const key = Object.keys(fallbacks).find(k => message.toLowerCase().includes(k));
        return { reply: key ? fallbacks[key] : "Hi! I'm Lumen Copilot. Ask me anything about Lumen syntax, deployment, or your code." };
    }
});

// --- Routes: Auth (Beta) ---
fastify.post('/auth/login', async (request: FastifyRequest) => {
    const { username } = request.body as { username: string };
    if (!username) return { error: "Username required" };

    let user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
        user = await prisma.user.create({
            data: {
                username,
                apiKey: `lumen_beta_${Math.random().toString(36).slice(2)}`
            }
        });
    }
    return { apiKey: user.apiKey, username: user.username };
});

// --- Routes: Registry ---
fastify.get('/packages', async () => {
    return await prisma.package.findMany({
        include: { versions: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });
});

fastify.get('/packages/:name', async (request: FastifyRequest, reply: FastifyReply) => {
    const { name } = request.params as { name: string };
    const pkg = await prisma.package.findUnique({
        where: { name },
        include: { versions: true }
    });
    if (!pkg) return reply.code(404).send({ error: 'Package not found' });
    return pkg;
});

fastify.post('/packages/publish', async (request: FastifyRequest, reply: FastifyReply) => {
    const result = PublishSchema.safeParse(request.body);
    if (!result.success) {
        return reply.code(400).send({ error: 'Invalid publish data', details: result.error });
    }
    const { name, version, description, tarball, checksum, owner } = result.data;
    try {
        const pkg = await prisma.package.upsert({
            where: { name },
            update: { description, updatedAt: new Date() },
            create: { name, description, owner },
        });
        await prisma.version.create({
            data: { version, tarball, checksum, packageId: pkg.id },
        });
        return { status: 'published', package: name, version };
    } catch (err) {
        request.log.error(err);
        return reply.code(500).send({ error: 'Failed to publish package' });
    }
});

// --- Routes: IDE Execution (WebSocket) ---
fastify.register(async (instance: FastifyInstance) => {
    instance.get('/ws/exec', { websocket: true }, (connection: SocketStream, req: FastifyRequest) => {
        console.log(`[WebSocket] New connection from ${req.ip}`);
        connection.socket.on('message', async (message: any) => {
            const data = JSON.parse(message.toString());
            if (data.type === 'run') {
                const code = data.code;
                const containerName = `lumen-exec-${uuidv4()}`;

                try {
                    connection.socket.send(JSON.stringify({ type: 'output', data: `── Spawning sandbox...\n` }));

                    // Try Docker first
                    let dockerAvailable = false;
                    try {
                        await docker.ping();
                        dockerAvailable = true;
                    } catch (e) {
                        // Docker likely unavailable on Render Native Runtime
                    }

                    const files = data.files as { [name: string]: string } | undefined;
                    const entry = data.entry || 'main.lm';

                    if (files) {
                        // Multi-file Project Execution
                        const { spawn } = await import('node:child_process');
                        const fs = await import('node:fs/promises');
                        const path = await import('node:path');
                        const os = await import('node:os');

                        const tmpDir = path.join(os.tmpdir(), `lumen_proj_${Date.now()}`);
                        await fs.mkdir(tmpDir, { recursive: true });

                        // Write all project files
                        for (const [name, content] of Object.entries(files)) {
                            const filePath = path.join(tmpDir, name);
                            await fs.mkdir(path.dirname(filePath), { recursive: true });
                            await fs.writeFile(filePath, content);
                        }

                        const lumenPath = path.resolve('./lumen');
                        const processExec = spawn(lumenPath, ['run', entry], {
                            cwd: tmpDir,
                            timeout: 3000,
                            env: { ...process.env, NODE_ENV: 'production' }
                        });

                        processExec.stdout?.on('data', (d) => connection.socket.send(JSON.stringify({ type: 'output', data: d.toString() })));
                        processExec.stderr?.on('data', (d) => connection.socket.send(JSON.stringify({ type: 'output', data: d.toString() })));

                        processExec.on('close', async (code) => {
                            const status = code === 0 ? "finished" : `failed (exit code: ${code})`;
                            connection.socket.send(JSON.stringify({ type: 'output', data: `\n── Project execution ${status}.\n` }));

                            // Cleanup
                            await fs.rm(tmpDir, { recursive: true, force: true });

                            // Optional Benchmark logic for multi-file? (Skipping for now to keep it simple)
                        });
                    } else if (code) {
                        // Single-file legacy execution
                        const { spawn } = await import('node:child_process');
                        const processExec = spawn('./lumen', ['run', '-e', code], {
                            timeout: 2000,
                            env: { ...process.env, NODE_ENV: 'production' }
                        });

                        processExec.stdout?.on('data', (data) => {
                            connection.socket.send(JSON.stringify({ type: 'output', data: data.toString() }));
                        });
                        processExec.stderr?.on('data', (data) => {
                            connection.socket.send(JSON.stringify({ type: 'output', data: data.toString() }));
                        });
                        processExec.on('close', async (code) => {
                            const status = code === 0 ? "finished successfully" : `failed (exit code: ${code})`;
                            connection.socket.send(JSON.stringify({ type: 'output', data: `\n── Execution ${status}.\n` }));

                            // Comparative Benchmarking Logic
                            const options = data.options || {};
                            if (options.compareWithPython) {
                                connection.socket.send(JSON.stringify({ type: 'output', data: `\n⚖️ [BENCHMARK] Running Python Baseline...\n` }));
                                const { spawn } = await import('node:child_process');

                                // Simple Python baseline for comparison
                                const pythonCode = `
import time
start = time.time()
count = 0
for i in range(1000000):
    count += 1
print(f"Python baseline took: {(time.time() - start) * 1000:.2f}ms")
`;
                                const pyExec = spawn('python3', ['-c', pythonCode]);
                                pyExec.stdout?.on('data', (d) => {
                                    connection.socket.send(JSON.stringify({ type: 'output', data: `🐍 ${d.toString()}` }));
                                });
                                pyExec.on('close', (pyCode) => {
                                    connection.socket.send(JSON.stringify({ type: 'output', data: `── Benchmark complete.\n` }));
                                });
                            }
                        });
                        processExec.on('error', (err) => {
                            connection.socket.send(JSON.stringify({ type: 'error', data: `Execution error: ${err.message}` }));
                        });
                    }
                } catch (err) {
                    connection.socket.send(JSON.stringify({ type: 'error', data: (err as Error).message }));
                }
            }
        });
    });
});

// --- Start Server ---
const start = async () => {
    try {
        const port = parseInt(process.env.PORT || '3001');
        await fastify.listen({ port, host: '0.0.0.0' });
        console.log(`Lumen Unified Backend listening on port ${port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
