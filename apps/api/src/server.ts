import fastify from 'fastify';
import tenantContextPlugin from './middleware/tenantContext';

import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import { authRoutes } from './modules/auth/auth.routes';

const server = fastify({ logger: true });

// Register CORS
server.register(fastifyCors, { origin: true });

// Register JWT
server.register(fastifyJwt, { secret: 'supersecret-aetherledger-key-change-me-in-prod' });

server.register(tenantContextPlugin);

// Register Feature Modules
server.register(authRoutes, { prefix: '/api/v1/auth' });
import { expenseRoutes } from './modules/expense/expense.routes';
server.register(expenseRoutes, { prefix: '/api/v1/expenses' });

server.get('/ping', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

const start = async () => {
  try {
    await server.listen({ port: 3001, host: '0.0.0.0' });
    server.log.info(`Server listening on port 3001`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
