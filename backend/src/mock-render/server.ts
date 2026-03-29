/**
 * Mock Render API server for local development and CI testing.
 * Mirrors the real Render API contract but returns deterministic responses.
 * 
 * Run with: npm run mock:render
 * Listens on: http://localhost:9090
 * 
 * Scenarios available via X-Mock-Scenario header:
 *   success (default) | build_fail | timeout | rate_limit | server_error
 */

import Fastify from 'fastify';

const mock = Fastify({ logger: false });
let serviceCounter = 1000;

mock.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
    try { done(null, JSON.parse(body as string)); } catch (e) { done(e as Error, undefined); }
});

function getScenario(request: any): string {
    return request.headers['x-mock-scenario'] || 'success';
}

// POST /services - Create service
mock.post('/services', async (request, reply) => {
    const scenario = getScenario(request);

    if (scenario === 'rate_limit') {
        return reply.code(429).send({ id: '', message: 'Rate limit exceeded' });
    }
    if (scenario === 'server_error') {
        return reply.code(500).send({ id: '', message: 'Internal server error' });
    }

    const body = request.body as any;
    const id = `srv-mock-${++serviceCounter}`;

    return reply.code(201).send({
        service: {
            id,
            name: body?.service?.name || 'mock-service',
            status: 'building',
            serviceDetails: { env: 'node', region: 'oregon', plan: 'free', suspended: 'not_suspended' },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    });
});

// GET /services/:id - Get service
mock.get('/services/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const scenario = getScenario(request);

    if (scenario === 'build_fail') {
        return reply.send({
            id,
            status: 'build_failed',
            serviceDetails: { env: 'node', suspended: 'suspended' }
        });
    }
    if (scenario === 'timeout') {
        await new Promise(r => setTimeout(r, 2000));
    }

    return reply.send({
        id,
        status: 'live',
        serviceDetails: { env: 'node', region: 'oregon', suspended: 'not_suspended' },
        serviceURL: `https://${id}.onrender.com`
    });
});

// GET /services/:id/deploys - List deploys
mock.get('/services/:id/deploys', async (request) => {
    const { id } = request.params as { id: string };
    return {
        deploys: [{
            id: `dep-mock-001`,
            serviceId: id,
            status: 'live',
            commit: { id: 'abc1234', message: 'Initial deploy', createdAt: new Date().toISOString() },
            createdAt: new Date().toISOString()
        }]
    };
});

// DELETE /services/:id - Delete service
mock.delete('/services/:id', async (request) => {
    return { id: (request.params as any).id, deleted: true };
});

// GET /services/:id/logs - Get deploy logs
mock.get('/services/:id/logs', async (request) => {
    return {
        logs: [
            { id: 'log-1', message: 'Build started', timestamp: new Date().toISOString(), level: 'info' },
            { id: 'log-2', message: 'Installing dependencies...', timestamp: new Date().toISOString(), level: 'info' },
            { id: 'log-3', message: 'npm install completed', timestamp: new Date().toISOString(), level: 'info' },
            { id: 'log-4', message: 'Starting service...', timestamp: new Date().toISOString(), level: 'info' },
            { id: 'log-5', message: 'Server listening on port 3000', timestamp: new Date().toISOString(), level: 'info' },
        ]
    };
});

mock.listen({ port: 9090, host: '0.0.0.0' }, (err, address) => {
    if (err) { console.error(err); process.exit(1); }
    console.log(`\n🎭 Mock Render API running at ${address}`);
    console.log('   Set RENDER_API_URL=http://localhost:9090 to use it.');
    console.log('   Scenarios: success | build_fail | timeout | rate_limit | server_error\n');
});
