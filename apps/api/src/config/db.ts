import { PrismaClient } from '@prisma/client';
import { getTenantContext } from '../middleware/tenantContext';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  }).$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          try {
            const context = getTenantContext();
            if (context) {
              // Automatically scope queries to tenantId if applicable
              if (args.where) {
                (args.where as any).tenantId = context.tenantId;
              }
            }
          } catch (e) {
            // No tenant context in current execution scope
          }
          return query(args);
        },
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma as any;
