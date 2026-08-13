// AI Service Stubs: Tesseract, ml.js Anomaly Detection, Ollama Copilot

export class AIService {
  async processReceiptOCR(imageUrl: string) {
    // 1. Fetch image
    // 2. Pass to Tesseract.js worker
    // 3. Extract Amount, Vendor, Category
    // Stub return
    return {
      amount: 15.99,
      vendor: 'Starbucks',
      category: 'Food & Beverage',
      confidence: 0.92,
    };
  }

  async runAnomalyDetection(expenseData: any, tenantHistory: any[]) {
    // Use ml.js (e.g. Isolation Forest or simple Z-Score) to detect outliers
    // Return an anomaly score
    return {
      isAnomaly: false,
      score: 0.05,
    };
  }

  async queryExpenseCopilot(prompt: string, tenantDataContext: any[]) {
    const p = prompt.toLowerCase();
    
    if (tenantDataContext.length === 0) {
      return "I don't see any expenses in your workspace yet.";
    }

    if (p.includes('highest') || p.includes('largest') || p.includes('max')) {
      const highest = [...tenantDataContext].sort((a, b) => b.amount - a.amount)[0];
      return `Your highest expense is ₹${highest.amount.toLocaleString()} at ${highest.vendor} on ${new Date(highest.date).toLocaleDateString()}.`;
    }

    if (p.includes('total') || p.includes('sum')) {
      const total = tenantDataContext.reduce((sum, e) => sum + e.amount, 0);
      return `The total spend for these ${tenantDataContext.length} recent expenses is ₹${total.toLocaleString()}.`;
    }

    if (p.includes('category') || p.includes('categories')) {
      const categories: Record<string, number> = {};
      tenantDataContext.forEach(e => {
        categories[e.category || 'Other'] = (categories[e.category || 'Other'] || 0) + e.amount;
      });
      const topCat = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
      return `Your highest spending category is ${topCat[0]} with ₹${topCat[1].toLocaleString()} total.`;
    }

    return "Based on your ledger, your spending is trending normally. I can answer questions about totals, highest expenses, or top categories!";
  }
}

export const aiService = new AIService();
