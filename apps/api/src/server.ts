import fastify from 'fastify';
import { addTenantContextHook } from './middleware/tenantContext';

import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import { authRoutes } from './modules/auth/auth.routes';

const server = fastify({ logger: true });

// Register CORS
server.register(fastifyCors, {
  origin: process.env.CORS_ORIGIN || true,
  credentials: true,
});

// Register JWT
server.register(fastifyJwt, { secret: process.env.JWT_SECRET || 'supersecret-aetherledger-key-change-me-in-prod' });

// Add global hooks
addTenantContextHook(server);

// Register Feature Modules
server.register(authRoutes, { prefix: '/api/v1/auth' });
import { expenseRoutes } from './modules/expense/expense.routes';
server.register(expenseRoutes, { prefix: '/api/v1/expenses' });

import { dashboardRoutes } from './modules/dashboard/dashboard.routes';
server.register(dashboardRoutes, { prefix: '/api/v1/dashboard' });

import { employeeRoutes } from './modules/employee/employee.routes';
server.register(employeeRoutes, { prefix: '/api/v1/employees' });

import { policyRoutes } from './modules/policy/policy.routes';
server.register(policyRoutes, { prefix: '/api/v1/policies' });

import { vendorRoutes } from './modules/vendor/vendor.routes';
server.register(vendorRoutes, { prefix: '/api/v1/vendors' });

server.get('/ping', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001', 10);
    await server.listen({ port, host: '0.0.0.0' });
    server.log.info(`Server listening on port ${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
