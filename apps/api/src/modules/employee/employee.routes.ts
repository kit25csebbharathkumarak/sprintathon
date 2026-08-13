import { FastifyInstance } from 'fastify';
import { prisma } from '../../config/db';


export async function employeeRoutes(fastify: FastifyInstance) {
  // GET all employees (users) in the workspace
  fastify.get('/', async (request, reply) => {
    const { tenantId } = (request as any).tenantContext;
    const users = await prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        department: true,
        location: true,
        costCenter: true,
        manager: true,
        spendingLimit: true,
        approvalAuth: true,
        createdAt: true,
      }
    });
    
    // Map to the shape expected by the frontend table mock
    const employees = users.map(user => ({
      fullId: user.id,
      id: user.id.slice(0, 8).toUpperCase(),
      name: user.name || user.email.split('@')[0].replace('.', ' '),
      email: user.email,
      dept: user.department || 'Unassigned', // In a real app this would be a relation
      designation: user.role,
      manager: user.manager || 'N/A',
      location: user.location || 'N/A',
      costCenter: user.costCenter || 'CC-000',
      limit: user.spendingLimit || (user.role === 'ADMIN' ? 'Unlimited' : '₹5,000/mo'),
      authority: user.approvalAuth || (user.role === 'ADMIN' ? 'Up to ₹25k' : 'No'),
      createdAt: user.createdAt
    }));

    return reply.status(200).send(employees);
  });

  // POST invite employee
  fastify.post('/invite', async (request, reply) => {
    const { email, role, name, department, location, costCenter, manager, spendingLimit, approvalAuth } = request.body as any;
    const { tenantId } = (request as any).tenantContext;

    // In a real app, this would send an email and generate a magic link.
    // For the demo, we just create a User with a default password.
    const newUser = await prisma.user.create({
      data: {
        email,
        password: 'defaultPassword123', // Demo purpose
        role: role || 'EMPLOYEE',
        name,
        department,
        location,
        costCenter,
        manager,
        spendingLimit,
        approvalAuth,
        tenantId
      }
    });

    return reply.status(201).send(newUser);
  });

  // PUT update employee
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as any;
    const { role, name, department, location, costCenter, manager, spendingLimit, approvalAuth } = request.body as any;
    const { tenantId } = (request as any).tenantContext;

    const updated = await prisma.user.updateMany({
      where: { 
        id,
        tenantId // Enforce isolation
      },
      data: { 
        role,
        name,
        department,
        location,
        costCenter,
        manager,
        spendingLimit,
        approvalAuth
      }
    });

    return reply.status(200).send({ success: updated.count > 0 });
  });

  // PATCH role
  fastify.patch('/:id/role', async (request, reply) => {
    const { id } = request.params as any;
    const { role } = request.body as any;
    const { tenantId } = (request as any).tenantContext;

    // Verify user belongs to tenant implicitly via where
    const updated = await prisma.user.updateMany({
      where: { 
        id,
        tenantId // Enforce isolation
      },
      data: { role }
    });

    return reply.status(200).send({ success: updated.count > 0 });
  });

  // DELETE employee
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as any;
    const { tenantId } = (request as any).tenantContext;

    try {
      // Must delete dependencies first (expenses)
      await prisma.expense.deleteMany({
        where: { userId: id, tenantId }
      });
      await prisma.user.delete({
        where: { id }
      });
      return reply.status(200).send({ success: true });
    } catch (error) {
      return reply.status(404).send({ error: 'User not found' });
    }
  });
}
