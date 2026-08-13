import { FastifyInstance } from 'fastify';
import { prisma } from '../../config/db';


export async function dashboardRoutes(fastify: FastifyInstance) {
  fastify.get('/summary', async (request, reply) => {
    const { tenantId } = (request as any).tenantContext;

    // 1. Fetch all expenses for this tenant
    const expenses = await prisma.expense.findMany({
      where: { tenantId }
    });

    // 2. Fetch policy violations
    const violationsCount = await prisma.policyViolation.count({
      where: { tenantId }
    });

    // Calculate YTD and Monthly
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const ytdExpenses = expenses.filter(e => new Date(e.date).getFullYear() === currentYear);
    const monthlyExpenses = ytdExpenses.filter(e => new Date(e.date).getMonth() === currentMonth);

    const totalSpendYtd = ytdExpenses.reduce((sum, e) => sum + e.amount, 0);
    const monthlySpend = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Pending stats
    const pendingExpenses = expenses.filter(e => e.status === 'PENDING' || e.status === 'MANAGER_APPROVED');
    const pendingApprovals = pendingExpenses.length;
    const pendingReimbursements = pendingExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    const flaggedExpenses = expenses.filter(e => e.status === 'FLAGGED');
    const outstandingExpenses = flaggedExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Group by Project
    const projectSpend: Record<string, number> = {};
    expenses.forEach(e => {
      const proj = e.project || 'Uncategorized';
      projectSpend[proj] = (projectSpend[proj] || 0) + e.amount;
    });
    const topProjectEntry = Object.entries(projectSpend).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];
    
    // Group by Department for Pie Chart
    const deptSpendMap: Record<string, number> = {};
    expenses.forEach(e => {
      const dept = e.department || 'Uncategorized';
      deptSpendMap[dept] = (deptSpendMap[dept] || 0) + e.amount;
    });
    const topDeptEntry = Object.entries(deptSpendMap).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];
    const deptData = Object.entries(deptSpendMap).map(([name, spend]) => ({ name, spend }));
    if (deptData.length === 0) {
      deptData.push({ name: 'Engineering', spend: 45000 }, { name: 'Marketing', spend: 20000 });
    }

    // Group by Category for Top Categories
    const categorySpend: Record<string, number> = {};
    let totalCatSpend = 0;
    expenses.forEach(e => {
      const cat = e.category || 'Other';
      categorySpend[cat] = (categorySpend[cat] || 0) + e.amount;
      totalCatSpend += e.amount;
    });
    
    let topCategories = Object.entries(categorySpend)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([label, value], i) => {
         const colors = ['var(--accent-electric)', 'var(--status-green)', 'var(--status-amber)', 'var(--bg-navy)'];
         return {
           label,
           value: `₹${value.toLocaleString('en-IN')}`,
           percentage: totalCatSpend ? `${Math.round((value / totalCatSpend) * 100)}%` : '0%',
           color: colors[i % colors.length]
         };
      });

    if (topCategories.length === 0) {
      topCategories = [
        { label: 'Software Licenses', value: '₹45,000', percentage: '65%', color: 'var(--accent-electric)' }
      ];
    }
    
    // Dummy trend data (mix of actual + dummy)
    const trendData = [
      { name: 'Jan', budget: 100000, actual: 85000 },
      { name: 'Feb', budget: 100000, actual: 92000 },
      { name: 'Mar', budget: 100000, actual: 78000 },
      { name: 'Apr', budget: 120000, actual: 110000 },
      { name: 'May', budget: 120000, actual: 105000 },
      { name: 'Jun', budget: 120000, actual: monthlySpend || 95000 },
    ];

    // Some fixed/computed mocks for the UI
    const budgetUtilization = 72; 
    const costSavings = 14500;

    return reply.status(200).send({
      totalSpendYtd,
      monthlySpend,
      budgetUtilization,
      costSavings,
      policyViolations: violationsCount,
      pendingApprovals,
      pendingReimbursements,
      outstandingExpenses,
      topProject: { name: topProjectEntry[0], amount: topProjectEntry[1] },
      topDept: { name: topDeptEntry[0], amount: topDeptEntry[1] },
      trendData,
      deptData,
      topCategories
    });
  });
}
