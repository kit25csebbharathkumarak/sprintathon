import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function adminRoutes(fastify: FastifyInstance) {
  
  // GET /api/v1/admin/dashboard
  // Fetch real metrics from the database
  fastify.get('/dashboard', async (request, reply) => {
    try {
      const totalTenants = await prisma.tenant.count();
      const totalUsers = await prisma.user.count();
      
      const expensesAggr = await prisma.expense.aggregate({
        _sum: { amount: true },
        _count: { id: true }
      });
      const totalRevenue = expensesAggr._sum.amount || 0;
      const expensesTracked = expensesAggr._count.id || 0;

      const invoicesAggr = await prisma.vendor.aggregate({
        _sum: { invoices: true }
      });
      const invoicesGenerated = invoicesAggr._sum.invoices || 0;

      // Real Data: Top 5 Tenants by Revenue
      const topTenantsDataRaw = await prisma.expense.groupBy({
        by: ['tenantId'],
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 5
      });

      const topTenantsColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
      const topTenants = await Promise.all(topTenantsDataRaw.map(async (t, i) => {
        const tenant = await prisma.tenant.findUnique({ where: { id: t.tenantId }});
        return {
          name: tenant?.name || 'Unknown',
          value: t._sum.amount || 0,
          color: topTenantsColors[i % topTenantsColors.length]
        };
      }));

      // Subscription Overview (DEDICATED vs SHARED)
      const dedicatedCount = await prisma.tenant.count({ where: { routingStrategy: 'DEDICATED' }});
      const sharedCount = await prisma.tenant.count({ where: { routingStrategy: 'SHARED' }});
      
      const subscriptionData = [
        { name: 'Enterprise', value: dedicatedCount, percentage: totalTenants > 0 ? `${Math.round(dedicatedCount/totalTenants*100)}%` : '0%', color: '#3b82f6' },
        { name: 'Professional', value: sharedCount, percentage: totalTenants > 0 ? `${Math.round(sharedCount/totalTenants*100)}%` : '0%', color: '#8b5cf6' },
      ];

      // Recent Activity
      // Let's get the 5 most recently created tenants
      const recentTenants = await prisma.tenant.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
      });
      
      const recentActivity = recentTenants.map((t, i) => ({
        id: t.id,
        title: `New tenant "${t.name}" signed up`,
        time: t.createdAt.toLocaleString(),
        icon: 'Building2',
        color: '#10b981',
        bg: '#d1fae5'
      }));

      // All Tenants Table Data
      const allTenantsList = await prisma.tenant.findMany({
        include: { _count: { select: { users: true } } }
      });

      const allTenants = await Promise.all(allTenantsList.map(async (t) => {
        const tExpenses = await prisma.expense.aggregate({ where: { tenantId: t.id }, _sum: { amount: true } });
        return {
          id: t.id,
          name: t.name,
          plan: t.routingStrategy === 'DEDICATED' ? 'Enterprise' : 'Professional',
          users: t._count.users,
          status: 'Active',
          revenue: `₹${(tExpenses._sum.amount || 0).toLocaleString()}`
        };
      }));

      // Revenue Overview Data (Mocking a 7-day trend since there might not be enough historical expense data yet)
      const revenueData = [
        { name: 'Day 1', revenue: totalRevenue * 0.1 },
        { name: 'Day 2', revenue: totalRevenue * 0.15 },
        { name: 'Day 3', revenue: totalRevenue * 0.12 },
        { name: 'Day 4', revenue: totalRevenue * 0.2 },
        { name: 'Day 5', revenue: totalRevenue * 0.18 },
        { name: 'Day 6', revenue: totalRevenue * 0.25 },
        { name: 'Day 7', revenue: totalRevenue },
      ];

      return reply.send({
        totalTenants,
        totalUsers,
        totalRevenue,
        expensesTracked,
        invoicesGenerated,
        revenueData,
        topTenants,
        subscriptionData,
        recentActivity,
        allTenants
      });
    } catch (e: any) {
      fastify.log.error(e);
      return reply.status(500).send({ error: e.message });
    }
  });

  // POST /api/v1/admin/tenants
  // Create a new tenant directly from the admin dashboard
  fastify.post('/tenants', async (request, reply) => {
    try {
      const { name, plan } = request.body as any;
      if (!name) return reply.status(400).send({ error: 'Tenant name is required' });

      const routingStrategy = plan === 'Enterprise' ? 'DEDICATED' : 'SHARED';
      
      const tenant = await prisma.tenant.create({
        data: {
          name,
          routingStrategy,
          dataSensitivity: plan === 'Enterprise' ? 'STRICT' : 'STANDARD'
        }
      });

      return reply.send({ success: true, tenant });
    } catch (e: any) {
      fastify.log.error(e);
      return reply.status(500).send({ error: e.message });
    }
  });
}
