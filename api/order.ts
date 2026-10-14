import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory ledger buffer for serverless executions
let inMemoryOrders = [
  {
    id: 'ord-108',
    timestamp: '12:29:14',
    symbol: 'BTC/USDT',
    side: 'BUY',
    price: 67410.20,
    size: 0.25,
    fee: 4.21,
    status: 'FILLED',
    consensusScore: '5 / 6',
    rationale: 'ORIN + NOVA flagged momentum breakout out of synaptic compression zone',
    primaryAgent: 'NOVA',
  },
  {
    id: 'ord-107',
    timestamp: '12:28:02',
    symbol: 'ETH/USDT',
    side: 'SELL',
    price: 3535.00,
    size: 4.2,
    fee: 3.71,
    status: 'FILLED',
    consensusScore: '6 / 6',
    rationale: 'VESK initiated synthetic hedge to limit portfolio beta exposure',
    primaryAgent: 'VESK',
  },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      orders: inMemoryOrders,
      totalOrders: inMemoryOrders.length,
    });
  }

  if (req.method === 'POST') {
    try {
      const { symbol, side, size, price, leverage, rationale, agent } = req.body || {};

      if (!symbol || !side || !size) {
        return res.status(400).json({
          success: false,
          error: 'Missing required order fields: symbol, side, size',
        });
      }

      // Risk verification (Agent 03 VESK serverless filter)
      const requestedLeverage = parseInt(leverage) || 1;
      if (requestedLeverage > 20) {
        return res.status(400).json({
          success: false,
          error: 'VESK Risk Armor Rejected: Leverage exceeds max ceiling of 20x',
        });
      }

      const orderPrice = parseFloat(price) || 67000;
      const orderSize = parseFloat(size);
      const notional = orderSize * orderPrice;

      if (notional > 500000) {
        return res.status(400).json({
          success: false,
          error: 'VESK Risk Armor Rejected: Single trade notional cannot exceed $500,000',
        });
      }

      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      const newOrder = {
        id: `ord-${Date.now().toString().slice(-4)}`,
        timestamp: timeStr,
        symbol,
        side: (side as string).toUpperCase(),
        price: orderPrice,
        size: orderSize,
        fee: parseFloat((notional * 0.0004).toFixed(2)),
        status: 'FILLED',
        consensusScore: '6 / 6',
        rationale: rationale || 'Discretionary trader order passed through synaptic risk filter',
        primaryAgent: agent || 'OPERATOR',
      };

      inMemoryOrders.unshift(newOrder);
      if (inMemoryOrders.length > 50) {
        inMemoryOrders.pop();
      }

      return res.status(201).json({
        success: true,
        message: 'Order dispatched and filled via Synaptic Route',
        order: newOrder,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err?.message || 'Failed to process order',
      });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
