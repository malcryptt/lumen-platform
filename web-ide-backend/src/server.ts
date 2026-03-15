import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import Docker from 'dockerode';
import { v4 as uuidv4 } from 'uuid';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const fastify = Fastify({ logger: true });
const docker = new Docker();

fastify.register(fastifyWebsocket);

fastify.register(async (fastify) => {
    fastify.get('/ws/exec', { websocket: true }, (connection, req) => {
        connection.socket.on('message', async (message: any) => {
            const data = JSON.parse(message.toString());
            if (data.type === 'run') {
                const code = data.code;
                const containerName = `lumen-exec-${uuidv4()}`;

                try {
                    connection.socket.send(JSON.stringify({
                        type: 'output',
                        data: `── Spawning sandbox...\n`
                    }));

                    // Check if Docker is available
                    let dockerAvailable = false;
                    try {
                        await docker.ping();
                        dockerAvailable = true;
                    } catch (e) {
                        connection.socket.send(JSON.stringify({
                            type: 'output',
                            data: `── Docker unavailable, falling back to local execution...\n`
                        }));
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
                        logs.on('data', (chunk) => {
                            connection.socket.send(JSON.stringify({ type: 'output', data: chunk.toString() }));
                        });
                        const result = await container.wait();
                        connection.socket.send(JSON.stringify({ type: 'output', data: `\n── Execution finished (exit code: ${result.StatusCode}).\n` }));
                        await container.remove();
                    } else {
                        // Fallback to child_process
                        const { exec } = require('child_process');
                        const process = exec(`lumen run -e "${code.replace(/"/g, '\\"')}"`, {
                            timeout: 5000,
                            maxBuffer: 1024 * 1024
                        });

                        process.stdout.on('data', (data: any) => {
                            connection.socket.send(JSON.stringify({ type: 'output', data: data.toString() }));
                        });

                        process.stderr.on('data', (data: any) => {
                            connection.socket.send(JSON.stringify({ type: 'output', data: data.toString() }));
                        });

                        process.on('close', (code: number) => {
                            connection.socket.send(JSON.stringify({ type: 'output', data: `\n── Execution finished (exit code: ${code}).\n` }));
                        });
                    }
                } catch (err) {
                    connection.socket.send(JSON.stringify({
                        type: 'error',
                        data: (err as Error).message
                    }));
                }
            }
        });
    });
});

const start = async () => {
    try {
        await fastify.listen({ port: 3001, host: '0.0.0.0' });
        console.log('Backend listening on port 3001');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
