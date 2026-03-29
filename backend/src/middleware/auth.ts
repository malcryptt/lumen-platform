import type { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Extracts the API key from the Authorization header, query param, or lumen_user localState.
 * Supports: "Bearer <apiKey>" or "?apiKey=..." or "X-API-Key: ..."
 */
export async function authMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
    let apiKey: string | undefined;

    // 1. Check Authorization header: "Bearer <token>"
    const authHeader = request.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
        apiKey = authHeader.slice(7).trim();
    }

    // 2. Check X-API-Key header
    if (!apiKey) {
        apiKey = request.headers['x-api-key'] as string | undefined;
    }

    // 3. Check query param (for CLI convenience)
    if (!apiKey) {
        apiKey = (request.query as any)?.apiKey;
    }

    if (!apiKey) {
        return reply.code(401).send({
            error: 'Unauthorized',
            message: 'Missing API key. Provide Authorization: Bearer <key> or X-API-Key header.'
        });
    }

    // Validate against DB
    const user = await prisma.user.findUnique({ where: { apiKey } });
    if (!user) {
        return reply.code(401).send({
            error: 'Unauthorized',
            message: 'Invalid or expired API key. Run `lumen login` to authenticate.'
        });
    }

    // Attach user to request for downstream handlers
    (request as any).user = user;
}

/**
 * Lightweight auth that also accepts CLI tokens (longer-lived).
 */
export async function cliAuthMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
    const token = request.headers['x-cli-token'] as string | undefined;
    if (!token) return authMiddleware(request, reply);

    const user = await prisma.user.findFirst({
        where: {
            cliToken: token,
            cliTokenExpiry: { gt: new Date() }
        }
    });

    if (!user) {
        return reply.code(401).send({
            error: 'Unauthorized',
            message: 'CLI token expired or invalid. Run `lumen login` again.'
        });
    }

    (request as any).user = user;
}
