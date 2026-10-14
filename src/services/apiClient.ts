// Client service communicating with Vercel Serverless Functions (/api/*)

export interface ServerlessMarketResponse {
  success: boolean;
  timestamp: number;
  market: Array<{
    symbol: string;
    name: string;
    price: number;
    change24h: number;
    high24h: number;
    low24h: number;
    volume24h: string;
    source: string;
  }>;
}

export interface ServerlessEvaluationResponse {
  success: boolean;
  data: {
    timestamp: string;
    symbol: string;
    consensus: string;
    action: string;
    consensusThresholdMet: boolean;
    primaryAgent: string;
    summary: string;
  };
}

export const apiClient = {
  // Check Vercel serverless health
  async checkHealth() {
    try {
      const res = await fetch('/api/health');
      if (res.ok) return await res.json();
    } catch {
      // In local dev without express /api router
    }
    return null;
  },

  // Fetch live market data from /api/market
  async getMarketData(): Promise<ServerlessMarketResponse | null> {
    try {
      const res = await fetch('/api/market', { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Offline or direct Vite dev mode
    }
    return null;
  },

  // Trigger agent evaluation from /api/evaluate
  async evaluateAgents(): Promise<ServerlessEvaluationResponse | null> {
    try {
      const res = await fetch('/api/evaluate', { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Offline fallback
    }
    return null;
  },

  // Dispatch order to /api/order
  async dispatchOrder(payload: {
    symbol: string;
    side: 'BUY' | 'SELL';
    size: number;
    price: number;
    leverage: number;
    rationale?: string;
  }) {
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return null;
  },
};
