import { AsyncLocalStorage } from 'async_hooks';
import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

// Define the context payload
export interface TenantContext {
  tenantId: string;
  userId: string;
  routingStrategy: string;
}

export const tenantStorage = new AsyncLocalStorage<TenantContext>();

export function getTenantContext(): TenantContext {
  const store = tenantStorage.getStore();
  if (!store) {
    throw new Error('No tenant context available. Make sure this is called within the request lifecycle.');
  }
  return store;
}

export default async function tenantContextPlugin(fastify: FastifyInstance) {
  fastify.addHook('onRequest', (request: FastifyRequest, reply: FastifyReply, done) => {
    // 1. Extract JWT token (e.g., from Authorization header)
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return done(); // Allow unauthenticated routes to pass, handle auth separately
    }

    try {
      const token = authHeader.replace('Bearer ', '');
      
      // Decode JWT using Fastify JWT instance
      const decoded = fastify.jwt.verify(token) as any;
      
      const context: TenantContext = {
        tenantId: decoded.tenantId,
        userId: decoded.userId,
        routingStrategy: decoded.routingStrategy,
      };

      // 3. Bind context to the async execution scope
      tenantStorage.run(context, () => {
        done();
      });
    } catch (err) {
      fastify.log.error(err);
      reply.status(401).send({ error: 'Invalid or Expired Token' });
    }
  });
}
