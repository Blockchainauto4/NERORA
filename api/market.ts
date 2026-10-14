import type { VercelRequest, VercelResponse } from '@vercel/node';

interface AssetQuote {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  source: 'live_exchange' | 'synthetic_feed';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Attempt to fetch real live prices from public ticker endpoint
    const binanceSymbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
    const quotes: AssetQuote[] = [];

    // Fallback baselines
    const baselines: Record<string, { name: string; price: number; change: number; high: number; low: number; vol: string }> = {
      'BTC/USDT': { name: 'Bitcoin', price: 67420.50, change: 3.42, high: 68250, low: 65110, vol: '1.42B' },
      'ETH/USDT': { name: 'Ethereum', price: 3512.80, change: 2.18, high: 3580, low: 3410, vol: '840M' },
      'SOL/USDT': { name: 'Solana', price: 184.25, change: 6.85, high: 188.5, low: 172, vol: '520M' },
      'NVDA/USD': { name: 'NVIDIA Corp', price: 142.60, change: 1.94, high: 144.1, low: 139.8, vol: '68M' },
    };

    try {
      const response = await fetch('https://api.binance.com/api/v3/ticker/24hr', {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(2500),
      });

      if (response.ok) {
        const data = await response.json();
        const map = new Map();
        if (Array.isArray(data)) {
          data.forEach((item: any) => map.set(item.symbol, item));
        }

        const btc = map.get('BTCUSDT');
        if (btc) {
          quotes.push({
            symbol: 'BTC/USDT',
            name: 'Bitcoin',
            price: parseFloat(btc.lastPrice),
            change24h: parseFloat(btc.priceChangePercent),
            high24h: parseFloat(btc.highPrice),
            low24h: parseFloat(btc.lowPrice),
            volume24h: `${(parseFloat(btc.quoteVolume) / 1e9).toFixed(2)}B`,
            source: 'live_exchange',
          });
        }

        const eth = map.get('ETHUSDT');
        if (eth) {
          quotes.push({
            symbol: 'ETH/USDT',
            name: 'Ethereum',
            price: parseFloat(eth.lastPrice),
            change24h: parseFloat(eth.priceChangePercent),
            high24h: parseFloat(eth.highPrice),
            low24h: parseFloat(eth.lowPrice),
            volume24h: `${(parseFloat(eth.quoteVolume) / 1e6).toFixed(0)}M`,
            source: 'live_exchange',
          });
        }

        const sol = map.get('SOLUSDT');
        if (sol) {
          quotes.push({
            symbol: 'SOL/USDT',
            name: 'Solana',
            price: parseFloat(sol.lastPrice),
            change24h: parseFloat(sol.priceChangePercent),
            high24h: parseFloat(sol.highPrice),
            low24h: parseFloat(sol.lowPrice),
            volume24h: `${(parseFloat(sol.quoteVolume) / 1e6).toFixed(0)}M`,
            source: 'live_exchange',
          });
        }
      }
    } catch {
      // In case exchange is unreachable or rate-limited, fail gracefully to baseline
    }

    // Add NVDA & any missing assets from baseline
    Object.keys(baselines).forEach((sym) => {
      if (!quotes.some((q) => q.symbol === sym)) {
        const b = baselines[sym];
        quotes.push({
          symbol: sym,
          name: b.name,
          price: b.price,
          change24h: b.change,
          high24h: b.high,
          low24h: b.low,
          volume24h: b.vol,
          source: 'synthetic_feed',
        });
      }
    });

    res.status(200).json({
      success: true,
      timestamp: Date.now(),
      market: quotes,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to fetch market data',
    });
  }
}
