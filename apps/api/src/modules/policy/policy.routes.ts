import { FastifyInstance } from 'fastify';
import { prisma } from '../../config/db';


export async function policyRoutes(fastify: FastifyInstance) {
  // GET active policies
  fastify.get('/', async (request, reply) => {
    const { tenantId } = (request as any).tenantContext;
    const policies = await prisma.policyRule.findMany({
      where: { tenantId }
    });
    
    // Map to UI expectations
    return reply.status(200).send(policies.map(p => ({
      id: p.id,
      name: p.name,
      type: p.type || p.category || 'General',
      description: p.description || (p.maxAmount ? `Maximum ₹${p.maxAmount} limit` : 'Custom rule'),
      status: p.active ? 'Active' : 'Inactive',
      severity: p.severity || 'Hard Block'
    })));
  });

  // POST new policy
  fastify.post('/', async (request, reply) => {
    const { name, category, maxAmount, type, description, severity } = request.body as any;
    const { tenantId } = (request as any).tenantContext;

    const rule = await prisma.policyRule.create({
      data: {
        tenantId,
        name,
        category,
        maxAmount: parseFloat(maxAmount) || null,
        type,
        description,
        severity,
        active: true
      }
    });

    return reply.status(201).send(rule);
  });

  // PUT update policy
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as any;
    const { name, category, maxAmount, type, description, severity } = request.body as any;
    const { tenantId } = (request as any).tenantContext;

    const updated = await prisma.policyRule.updateMany({
      where: { id, tenantId },
      data: {
        name,
        category,
        maxAmount: parseFloat(maxAmount) || null,
        type,
        description,
        severity
      }
    });

    return reply.status(200).send({ success: updated.count > 0 });
  });

  // PATCH policy status
  fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params as any;
    const { active } = request.body as any;
    const { tenantId } = (request as any).tenantContext;

    const updated = await prisma.policyRule.updateMany({
      where: { id, tenantId },
      data: { active }
    });

    return reply.status(200).send({ success: updated.count > 0 });
  });

  // DELETE policy
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as any;
    const { tenantId } = (request as any).tenantContext;

    try {
      // First delete associated violations due to foreign key
      await prisma.policyViolation.deleteMany({
        where: { ruleId: id }
      });
      await prisma.policyRule.delete({
        where: { id }
      });
      return reply.status(200).send({ success: true });
    } catch (error) {
      return reply.status(404).send({ error: 'Policy not found' });
    }
  });

  // GET policy violations
  fastify.get('/violations', async (request, reply) => {
    const { tenantId } = (request as any).tenantContext;
    const violations = await prisma.policyViolation.findMany({
      where: { tenantId },
      include: {
        expense: { select: { amount: true, vendor: true } },
        rule: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return reply.status(200).send(violations);
  });
}
