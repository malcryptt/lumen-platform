import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

// Schemas
const PublishSchema = z.object({
    name: z.string().min(2),
    version: z.string(),
    description: z.string().optional(),
    tarball: z.string().url(),
    checksum: z.string(),
    owner: z.string(),
});

// Routes
fastify.get('/health', async () => ({ status: 'ok' }));

// List packages
fastify.get('/packages', async () => {
    return await prisma.package.findMany({
        include: { versions: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });
});

// Get package details
fastify.get('/packages/:name', async (request, reply) => {
    const { name } = request.params as { name: string };
    const pkg = await prisma.package.findUnique({
        where: { name },
        include: { versions: true }
    });

    if (!pkg) return reply.code(404).send({ error: 'Package not found' });
    return pkg;
});

// Publish a package
fastify.post('/packages/publish', async (request, reply) => {
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

        const newVersion = await prisma.version.create({
            data: {
                version,
                tarball,
                checksum,
                packageId: pkg.id,
            },
        });

        return { status: 'published', package: name, version };
    } catch (err) {
        request.log.error(err);
        return reply.code(500).send({ error: 'Failed to publish package' });
    }
});

const start = async () => {
    try {
        await fastify.listen({ port: 3002, host: '0.0.0.0' });
        console.log('Lumen Package Registry listening on port 3002');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
