import { FastifyInstance } from 'fastify';
import { prisma } from '../../config/db';


export async function vendorRoutes(fastify: FastifyInstance) {
  // GET vendors
  fastify.get('/', async (request, reply) => {
    const { tenantId } = (request as any).tenantContext;
    const vendors = await prisma.vendor.findMany({
      where: { tenantId }
    });
    return reply.status(200).send(vendors);
  });

  // POST new vendor
  fastify.post('/', async (request, reply) => {
    const { name, gstin, contact, category, terms, spend, contract } = request.body as any;
    const { tenantId } = (request as any).tenantContext;

    const vendor = await prisma.vendor.create({
      data: {
        tenantId,
        name,
        gstin,
        contact,
        category,
        terms,
        spend,
        contract,
        invoices: 0
      }
    });

    return reply.status(201).send(vendor);
  });

  // PUT update vendor
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as any;
    const { name, gstin, contact, category, terms, spend, contract } = request.body as any;
    const { tenantId } = (request as any).tenantContext;

    const updated = await prisma.vendor.updateMany({
      where: { id, tenantId },
      data: {
        name,
        gstin,
        contact,
        category,
        terms,
        spend,
        contract
      }
    });

    return reply.status(200).send({ success: updated.count > 0 });
  });

  // DELETE vendor
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as any;
    const { tenantId } = (request as any).tenantContext;

    const deleted = await prisma.vendor.deleteMany({
      where: { id, tenantId }
    });

    return reply.status(200).send({ success: deleted.count > 0 });
  });
}
