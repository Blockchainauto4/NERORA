export interface Agent {
  id: string;
  number: string; // "01", "02", etc.
  name: string; // "NOVA", "ORIN", "VESK", "LUMA", "KIRA", "DASH"
  role: string; // "Strategic Discovery", "Predictive Analysis", etc.
  description: string;
  outputSim: number; // e.g. +2948
  utilization: number; // e.g. 80
  route: string; // "ROUTE 01"
  active: boolean;
  alignment: number; // e.g. 0.78
  fieldNodes: string; // "NX-0101 - 0107"
  eventRate: number; // e.g. 66
  color: string;
  strategyFocus: string;
  confidence: number;
}

export interface MarketAsset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  sparkline: number[];
}

export interface Position {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  currentPrice: number;
  size: number;
  leverage: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  openedAt: string;
  agentOrigin: string;
  stopLoss?: number;
  takeProfit?: number;
}

export interface TradeOrder {
  id: string;
  timestamp: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  price: number;
  size: number;
  pnl?: number;
  fee: number;
  status: 'FILLED' | 'OPEN' | 'CANCELLED';
  consensusScore: string; // "5 / 6"
  rationale: string;
  primaryAgent: string;
}

export interface SystemMetrics {
  balance: number;
  baseBalance: number;
  combinedOutput: number;
  returnPercent: number;
  decisionAccuracy: number;
  eventRate: number;
  latencyMs: number;
  agentConsensusActive: number;
  agentConsensusTotal: number;
  angularVelocity: number;
  axialStretch: number;
  coherence: number;
  activeField: string;
  roundNumber: number;
  winRate: number;
  sharpeRatio: number;
  profitFactor: number;
  totalDecisions: number;
}

export interface CortexTracePoint {
  id: string;
  timeStr: string;
  timestamp: number;
  value: number; // 0 to 100
  baseline: number;
  marker?: {
    type: 'BUY' | 'SELL' | 'REBALANCE' | 'DEFENSE';
    agent: string;
    label: string;
    details: string;
  };
}

export interface EquityPoint {
  timestamp: number;
  timeStr: string;
  equity: number;
  netChange: number;
}
