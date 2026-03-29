import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { encryptForStorage } from '../deployer/secrets.js';
import { config } from '../../config.js';

const prisma = new PrismaClient();

/**
 * GitHub OAuth Authentication routes (Section 3.3).
 * Used for cloning private repositories.
 */
export async function githubAuthRoutes(fastify: FastifyInstance) {
    fastify.get('/github', async (request: FastifyRequest, reply: FastifyReply) => {
        const userId = (request as any).user.id;
        const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${config.GITHUB_CLIENT_ID}&scope=repo&state=${userId}`;
        return reply.redirect(redirectUrl);
    });

    fastify.get('/github/callback', async (request: FastifyRequest, reply: FastifyReply) => {
        const { code, state: userId } = request.query as { code: string; state: string };

        if (!code) return reply.code(400).send({ error: 'Missing OAuth code' });

        try {
            // Exchange code for token
            const tokenRes = await axios.post('https://github.com/login/oauth/access_token', {
                client_id: config.GITHUB_CLIENT_ID,
                client_secret: config.GITHUB_CLIENT_SECRET,
                code
            }, {
                headers: { Accept: 'application/json' }
            });

            const githubToken = tokenRes.data.access_token;
            if (!githubToken) throw new Error('Failed to obtain Github token');

            // Encrypt and store (Section 3.3/3.4)
            const encrypted = encryptForStorage(githubToken);

            await prisma.userIntegration.upsert({
                where: { userId },
                create: {
                    userId,
                    githubTokenEnc: encrypted.valueEnc,
                    githubTokenIv: encrypted.iv
                },
                update: {
                    githubTokenEnc: encrypted.valueEnc,
                    githubTokenIv: encrypted.iv
                }
            });

            return reply.send({ success: true, message: 'GitHub connected successfully. You can now scan private repos.' });
        } catch (err: any) {
            fastify.log.error('Github OAuth failed:', err.message);
            return reply.code(500).send({ error: 'Github OAuth exchange failed', details: err.message });
        }
    });
}
