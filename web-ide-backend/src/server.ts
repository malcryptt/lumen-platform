import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import Docker from 'dockerode';
import { v4 as uuidv4 } from 'uuid';

const fastify = Fastify({ logger: true });
const docker = new Docker();

fastify.register(fastifyWebsocket);

fastify.register(async (fastify) => {
    fastify.get('/ws/exec', { websocket: true }, (connection, req) => {
        connection.socket.on('message', async (message) => {
            const data = JSON.parse(message.toString());
            if (data.type === 'run') {
                const code = data.code;
                const containerName = `lumen-exec-${uuidv4()}`;

                try {
                    connection.socket.send(JSON.stringify({
                        type: 'output',
                        data: `── Spawning sandbox container...\n`
                    }));

                    const container = await docker.createContainer({
                        Image: 'lumen-sandbox',
                        Cmd: ['lumen', 'run', '-e', code],
                        name: containerName,
                        HostConfig: {
                            Memory: 128 * 1024 * 1024, // 128MB
                            CpuQuota: 50000,           // 0.5 CPU
                            NetworkMode: 'none',
                        },
                    });

                    await container.start();

                    const logs = await container.logs({
                        stdout: true,
                        stderr: true,
                        follow: true,
                    });

                    logs.on('data', (chunk) => {
                        connection.socket.send(JSON.stringify({
                            type: 'output',
                            data: chunk.toString(),
                        }));
                    });

                    const result = await container.wait();
                    connection.socket.send(JSON.stringify({
                        type: 'output',
                        data: `\n── Execution finished (exit code: ${result.StatusCode}).\n`
                    }));

                    await container.remove();

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
