import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

export interface TenantContext {
  tenantId: string;
  userId: string;
  routingStrategy: string;
}

export function addTenantContextHook(fastify: FastifyInstance) {
  fastify.addHook('onRequest', (request: FastifyRequest, reply: FastifyReply, done) => {
    const authHeader = request.headers.authorization;
    if (!authHeader || authHeader === 'Bearer null' || authHeader === 'Bearer undefined' || authHeader === 'Bearer ') {
      return done();
    }

    try {
      const token = authHeader.replace('Bearer ', '');
      const decoded = fastify.jwt.verify(token) as any;
      
      const context: TenantContext = {
        tenantId: decoded.tenantId,
        userId: decoded.userId,
        routingStrategy: decoded.routingStrategy,
      };

      (request as any).tenantContext = context;
      done();
    } catch (err) {
      fastify.log.error(err);
      reply.status(401).send({ error: 'Invalid or Expired Token' });
    }
  });
}
