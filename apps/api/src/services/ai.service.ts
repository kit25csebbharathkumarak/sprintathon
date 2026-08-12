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

  async queryExpenseCopilot(prompt: string, tenantDataContext: any) {
    // Call self-hosted Ollama Llama 3 8B
    // Prompt structure: "Given the following expense data: {tenantDataContext}, answer the question: {prompt}"
    
    // Stub return
    return "Based on your ledger, your highest spending category this month is Travel.";
  }
}

export const aiService = new AIService();
