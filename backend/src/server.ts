import Fastify, { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import fastifyWebsocket, { SocketStream } from '@fastify/websocket';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import Docker from 'dockerode';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Buffer } from 'node:buffer';
import process from 'node:process';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();
const docker = new Docker();

// --- Initialization ---
fastify.register(cors, { origin: '*' });
fastify.register(fastifyWebsocket);

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

                    if (dockerAvailable) {
                        const container = await docker.createContainer({
                            Image: 'lumen-sandbox',
                            Cmd: ['lumen', 'run', '-e', code],
                            name: containerName,
                            HostConfig: {
                                Memory: 128 * 1024 * 1024,
                                CpuQuota: 50000,
                                NetworkMode: 'none',
                            },
                        });
                        await container.start();
                        const logs = await container.logs({ stdout: true, stderr: true, follow: true });
                        logs.on('data', (chunk: Buffer) => {
                            connection.socket.send(JSON.stringify({ type: 'output', data: chunk.toString() }));
                        });
                        const result = await container.wait();
                        connection.socket.send(JSON.stringify({ type: 'output', data: `\n── Execution finished (exit code: ${result.StatusCode}).\n` }));
                        await container.remove();
                    } else {
                        // Fallback to local 'lumen' binary execution with restricted environment
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
                        processExec.on('close', (code) => {
                            const status = code === 0 ? "finished successfully" : `failed (exit code: ${code})`;
                            connection.socket.send(JSON.stringify({ type: 'output', data: `\n── Execution ${status}.\n` }));
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
