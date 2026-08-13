import { FastifyInstance } from 'fastify';
import { prisma } from '../../config/db';

import { ledgerService } from '../../services/ledger.service';
import { aiService } from '../../services/ai.service';
import crypto from 'crypto';

export async function expenseRoutes(fastify: FastifyInstance) {
  // GET all expenses for the current tenant
  fastify.get('/', async (request, reply) => {
    const { tenantId } = (request as any).tenantContext;
    const expenses = await prisma.expense.findMany({
      where: { tenantId },
      orderBy: { date: 'desc' },
    });
    return expenses;
  });

  // POST a new expense
  fastify.post('/', async (request, reply) => {
    const { amount, vendor, category, date, currency, receiptUrl, project, department } = request.body as any;
    const { tenantId, userId } = (request as any).tenantContext;

    // 1. Fetch previous event hash for the ledger chain (simplified logic)
    const prevExpense = await prisma.expense.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    const prevEventHash = prevExpense?.eventHash || null;

    // 2. Compute current event hash
    const payloadToHash = `${tenantId}:${userId}:${amount}:${vendor}:${date}:${prevEventHash}`;
    const eventHash = crypto.createHash('sha256').update(payloadToHash).digest('hex');

    // AI Anomaly detection
    const anomalyResult = await aiService.runAnomalyDetection({ amount, vendor, category }, []);
    const status = anomalyResult.isAnomaly ? 'FLAGGED' : 'PENDING';

    // 3. Save to DB
    const newExpense = await prisma.expense.create({
      data: {
        tenantId,
        userId,
        amount,
        vendor,
        category,
        date: new Date(date),
        currency,
        receiptUrl,
        project,
        department,
        eventHash,
        prevEventHash,
        status,
        anomalyScore: anomalyResult.score
      },
    });

    // 4. Policy Evaluation (Synchronous for Demo to show immediate violations)
    const activePolicies = await prisma.policyRule.findMany({
      where: { tenantId, active: true }
    });

    for (const rule of activePolicies) {
      let isViolation = false;
      let reason = '';

      if (rule.maxAmount && amount > rule.maxAmount) {
        if (!rule.category || rule.category === category) {
           isViolation = true;
           reason = `Exceeded max limit of ₹${rule.maxAmount} for ${rule.category || 'all categories'}`;
        }
      }

      if (isViolation) {
        await prisma.policyViolation.create({
          data: {
            tenantId,
            expenseId: newExpense.id,
            ruleId: rule.id,
            reason
          }
        });
      }
    }

    // Emit event to Redpanda for immutable ledger
    await ledgerService.appendExpenseEvent(newExpense);

    return reply.status(201).send(newExpense);
  });

  // PATCH an expense (e.g. update status or edit fields)
  fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params as any;
    const { status, purpose, amount, category, vendor, date, project, department } = request.body as any;
    const { tenantId } = (request as any).tenantContext;

    const dataToUpdate: any = {};
    if (status) dataToUpdate.status = status;
    if (purpose !== undefined) dataToUpdate.purpose = purpose;
    if (amount) dataToUpdate.amount = amount;
    if (category) dataToUpdate.category = category;
    if (vendor) dataToUpdate.vendor = vendor;
    if (date) dataToUpdate.date = new Date(date);
    if (project) dataToUpdate.project = project;
    if (department) dataToUpdate.department = department;

    try {
      const updated = await prisma.expense.update({
        where: { id },
        data: dataToUpdate
      });
      // Optionally emit a ledger event for the update
      return reply.status(200).send(updated);
    } catch (error) {
      return reply.status(404).send({ error: 'Expense not found' });
    }
  });

  // DELETE an expense
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as any;
    const { tenantId } = (request as any).tenantContext;

    try {
      // First delete associated violations due to foreign key
      await prisma.policyViolation.deleteMany({
        where: { expenseId: id }
      });

      await prisma.expense.delete({
        where: { id }
      });
      return reply.status(200).send({ success: true });
    } catch (error) {
      return reply.status(404).send({ error: 'Expense not found' });
    }
  });

  // POST a receipt for OCR
  fastify.post('/ocr', async (request, reply) => {
    try {
      const { receiptUrl } = request.body as any;
      const extractedData = await aiService.processReceiptOCR(receiptUrl);
      return reply.status(200).send(extractedData);
    } catch (e: any) {
      console.error('OCR Route Error:', e);
      return reply.status(500).send({ error: e.message || 'AI processing failed' });
    }
  });

  // GET verify tamper hash ledger
  fastify.get('/verify-ledger', async (request, reply) => {
    const { tenantId } = (request as any).tenantContext;
    const expenses = await prisma.expense.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'asc' }
    });

    let prevHash: string | null = null;
    const tamperedIds: string[] = [];

    for (const exp of expenses) {
      if (exp.prevEventHash !== prevHash) {
        tamperedIds.push(exp.id);
      } else {
        const payloadToHash = `${exp.tenantId}:${exp.userId}:${exp.amount}:${exp.vendor}:${exp.date.toISOString()}:${exp.prevEventHash}`;
        const computedHash = crypto.createHash('sha256').update(payloadToHash).digest('hex');
        
        if (computedHash !== exp.eventHash) {
          tamperedIds.push(exp.id);
        }
      }
      prevHash = exp.eventHash;
    }

    return reply.status(200).send({
      isValid: tamperedIds.length === 0,
      tamperedIds,
      totalChecked: expenses.length
    });
  });

  // POST a natural language copilot query
  fastify.post('/copilot', async (request, reply) => {
    const { prompt } = request.body as any;
    const { tenantId } = (request as any).tenantContext;
    
    // Pass tenant context history (e.g. recent expenses)
    const recentExpenses = await prisma.expense.findMany({
      where: { tenantId },
      take: 50,
      orderBy: { date: 'desc' }
    });

    const response = await aiService.queryExpenseCopilot(prompt, recentExpenses);
    return reply.status(200).send({ response });
  });
}
