import { GoogleGenAI, Type } from '@google/genai';

export class AIService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'MISSING' });
  }

  async processReceiptOCR(imageUrl: string) {
    try {
      if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set.");
      
      let mimeType = 'image/jpeg';
      let data = '';

      if (imageUrl.startsWith('http')) {
        const response = await fetch(imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        data = buffer.toString('base64');
        mimeType = response.headers.get('content-type') || 'image/jpeg';
      } else if (imageUrl.startsWith('data:image')) {
        // Handle base64 data URL
        const parts = imageUrl.split(';');
        mimeType = parts[0].split(':')[1];
        data = parts[1].split(',')[1];
      }

      const prompt = "Extract the receipt details. Return a JSON object exactly matching the schema. If you cannot determine a value, make your best guess or return a default.";
      
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { inlineData: { data, mimeType } },
          prompt
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              amount: { type: Type.NUMBER, description: 'Total amount of the receipt' },
              vendor: { type: Type.STRING, description: 'Name of the merchant/vendor' },
              category: { type: Type.STRING, description: 'Best category for this expense e.g., Food & Beverage, Travel, Office Supplies' },
              confidence: { type: Type.NUMBER, description: 'Confidence score from 0.0 to 1.0' }
            },
            required: ['amount', 'vendor', 'category', 'confidence']
          }
        }
      });
      
      const text = response.text || '{}';
      return JSON.parse(text);
    } catch (e) {
      console.error('OCR Error:', e);
      return { amount: 0, vendor: 'Unknown', category: 'Other', confidence: 0 };
    }
  }

  async runAnomalyDetection(expenseData: any, tenantHistory: any[]) {
    try {
      if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set.");
      
      const prompt = `
        You are a financial fraud detection AI.
        Here is a new expense: ${JSON.stringify(expenseData)}
        Here is the recent history for this company: ${JSON.stringify(tenantHistory.slice(0, 30))}
        
        Is this new expense an anomaly? (e.g. abnormally high amount, unusual vendor, etc).
        Return a JSON object with 'isAnomaly' (boolean), 'score' (number between 0.0 and 1.0 where 1.0 is highly anomalous), and 'reason' (short string).
      `;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isAnomaly: { type: Type.BOOLEAN },
              score: { type: Type.NUMBER },
              reason: { type: Type.STRING }
            },
            required: ['isAnomaly', 'score', 'reason']
          }
        }
      });

      const text = response.text || '{}';
      return JSON.parse(text);
    } catch (e) {
      console.error('Anomaly Detection Error:', e);
      return { isAnomaly: false, score: 0.0, reason: 'Error checking anomaly' };
    }
  }

  async queryExpenseCopilot(prompt: string, tenantDataContext: any[]) {
    try {
      if (!process.env.GEMINI_API_KEY) return "AI features require GEMINI_API_KEY to be configured in the environment.";
      
      const contextStr = JSON.stringify(tenantDataContext.slice(0, 50));
      
      const systemPrompt = `You are a helpful, expert AI Financial Copilot for a company's expense management platform. 
      You are helping an employee or manager understand their spending.
      Answer their query based ONLY on the following recent expense data:
      ${contextStr}
      
      User Query: ${prompt}
      `;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: systemPrompt
      });

      return response.text || "I'm sorry, I couldn't generate a response.";
    } catch (e: any) {
      console.error('Copilot Error:', e);
      return `AI Connection Error: ${e.message || "Failed to generate content."}`;
    }
  }
}

export const aiService = new AIService();
