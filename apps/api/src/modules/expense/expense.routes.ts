import { FastifyInstance } from 'fastify';
import { prisma } from '../../config/db';
import { getTenantContext } from '../../middleware/tenantContext';
import { ledgerService } from '../../services/ledger.service';
import { aiService } from '../../services/ai.service';
import crypto from 'crypto';

export async function expenseRoutes(fastify: FastifyInstance) {
  // GET all expenses for the current tenant
  fastify.get('/', async (request, reply) => {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' },
    });
    return expenses;
  });

  // POST a new expense
  fastify.post('/', async (request, reply) => {
    const { amount, vendor, category, date, currency, receiptUrl } = request.body as any;
    const { tenantId, userId } = getTenantContext();

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
        eventHash,
        prevEventHash,
        status,
        anomalyScore: anomalyResult.score
      },
    });

    // Emit event to Redpanda for immutable ledger
    await ledgerService.appendExpenseEvent(newExpense);

    return reply.status(201).send(newExpense);
  });

  // POST a receipt for OCR
  fastify.post('/ocr', async (request, reply) => {
    // Simplified: expect an image URL in body
    const { receiptUrl } = request.body as any;
    const extractedData = await aiService.processReceiptOCR(receiptUrl);
    return reply.status(200).send(extractedData);
  });

  // POST a natural language copilot query
  fastify.post('/copilot', async (request, reply) => {
    const { prompt } = request.body as any;
    const { tenantId } = getTenantContext();
    
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
