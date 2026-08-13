import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  const tenant = await prisma.tenant.upsert({
    where: { id: 'demo-tenant-123' },
    update: {},
    create: {
      id: 'demo-tenant-123',
      name: 'Acme Corp',
      routingStrategy: 'SHARED',
    }
  });

  const user = await prisma.user.upsert({
    where: { id: 'demo-user-123' },
    update: {},
    create: {
      id: 'demo-user-123',
      email: 'admin@acmecorp.com',
      password: 'password123',
      role: 'ADMIN',
      tenantId: tenant.id
    }
  });

  // Create a budget
  await prisma.budget.create({
    data: {
      tenantId: tenant.id,
      month: '2026-08',
      department: 'Engineering',
      amount: 100000
    }
  });

  // Create some expenses
  const expenses = [
    { amount: 1500, vendor: 'AWS', category: 'Software', date: new Date(), project: 'Project Alpha', department: 'Engineering' },
    { amount: 450, vendor: 'Uber', category: 'Travel', date: new Date(), project: 'Sales Trip', department: 'Sales' },
    { amount: 12000, vendor: 'Salesforce', category: 'Software', date: new Date(), project: 'CRM', department: 'Sales' },
    { amount: 80, vendor: 'Starbucks', category: 'Meals', date: new Date(), project: 'Client Meeting', department: 'Sales' }
  ];

  for (const exp of expenses) {
    await prisma.expense.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        amount: exp.amount,
        vendor: exp.vendor,
        category: exp.category,
        date: exp.date,
        project: exp.project,
        department: exp.department,
        status: 'PENDING'
      }
    });
  }
  
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
