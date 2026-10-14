import React, { useState } from 'react';
import { Position, TradeOrder, MarketAsset, Agent } from '../types/trading';
import { X, ArrowUpRight, ArrowDownRight, CheckCircle2, Download, AlertCircle, RefreshCw } from 'lucide-react';

interface TradeDeskModalProps {
  isOpen: boolean;
  onClose: () => void;
  positions: Position[];
  orders: TradeOrder[];
  assets: MarketAsset[];
  activeAsset: MarketAsset;
  agents: Agent[];
  onClosePosition: (positionId: string) => void;
  onExecuteManualTrade: (trade: {
    symbol: string;
    side: 'BUY' | 'SELL';
    size: number;
    price: number;
    leverage: number;
  }) => void;
}

export const TradeDeskModal: React.FC<TradeDeskModalProps> = ({
  isOpen,
  onClose,
  positions,
  orders,
  assets,
  activeAsset,
  agents,
  onClosePosition,
  onExecuteManualTrade,
}) => {
  const [activeTab, setActiveTab] = useState<'POSITIONS' | 'ORDER_LOG' | 'NEW_ORDER'>('POSITIONS');

  // Manual trade form
  const [symbol, setSymbol] = useState<string>(activeAsset.symbol);
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [size, setSize] = useState<number>(0.5);
  const [leverage, setLeverage] = useState<number>(5);

  if (!isOpen) return null;

  const currentSelectedAsset = assets.find((a) => a.symbol === symbol) || activeAsset;
  const estimatedCost = (size * currentSelectedAsset.price) / leverage;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExecuteManualTrade({
      symbol,
      side,
      size,
      price: currentSelectedAsset.price,
      leverage,
    });
    setActiveTab('POSITIONS');
  };

  const exportCSV = () => {
    const headers = 'ID,Timestamp,Symbol,Side,Price,Size,Status,Consensus,Agent\n';
    const rows = orders
      .map(
        (o) =>
          `"${o.id}","${o.timestamp}","${o.symbol}","${o.side}",${o.price},${o.size},"${o.status}","${o.consensusScore}","${o.primaryAgent}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexora_trade_log_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-[#070e1c] border border-cyan-500/30 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-cyan-500/20 flex items-center justify-between bg-[#040813]">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="font-mono text-base font-bold text-white tracking-wide">
              EXECUTION DESK & LEDGER
            </h2>
            <span className="text-xs font-mono text-cyan-400/80 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/20">
              SYNTHETIC MULTI-AGENT ROUTER
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportCSV}
              className="text-xs font-mono text-slate-300 hover:text-cyan-300 flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 transition-colors"
              title="Export Trade Ledger to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-800/80 bg-[#050b17] font-mono text-xs">
          <button
            onClick={() => setActiveTab('POSITIONS')}
            className={`px-4 py-2 border-b-2 font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'POSITIONS'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            OPEN POSITIONS ({positions.length})
          </button>
          <button
            onClick={() => setActiveTab('ORDER_LOG')}
            className={`px-4 py-2 border-b-2 font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'ORDER_LOG'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ORDER EXECUTION LOG ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('NEW_ORDER')}
            className={`px-4 py-2 border-b-2 font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'NEW_ORDER'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            + DISCRETIONARY ORDER
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto flex-1 font-mono text-xs">
          {/* TAB 1: POSITIONS */}
          {activeTab === 'POSITIONS' && (
            <div className="space-y-3">
              {positions.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  <p>No open positions in synthetic memory.</p>
                  <p className="text-[11px] mt-1 text-slate-600">The six agents will enter positions when consensus aligns.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-cyan-500/15 text-[10px] text-slate-400 tracking-wider">
                        <th className="py-2 px-3">ASSET</th>
                        <th className="py-2 px-3">SIDE / LEV</th>
                        <th className="py-2 px-3 text-right">SIZE</th>
                        <th className="py-2 px-3 text-right">ENTRY</th>
                        <th className="py-2 px-3 text-right">MARK</th>
                        <th className="py-2 px-3 text-right">UNREALIZED PnL</th>
                        <th className="py-2 px-3">AGENT SOURCE</th>
                        <th className="py-2 px-3 text-center">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {positions.map((pos) => {
                        const isProfit = pos.unrealizedPnl >= 0;
                        return (
                          <tr key={pos.id} className="hover:bg-slate-900/50 transition-colors">
                            <td className="py-2.5 px-3 font-bold text-white">
                              {pos.symbol}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  pos.side === 'LONG'
                                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                                }`}
                              >
                                {pos.side} {pos.leverage}x
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-200">
                              {pos.size}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-300">
                              ${pos.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-2.5 px-3 text-right text-cyan-300 font-semibold">
                              ${pos.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold">
                              <span className={isProfit ? 'text-emerald-400' : 'text-rose-400'}>
                                {isProfit ? '+' : ''}${pos.unrealizedPnl.toFixed(2)} ({isProfit ? '+' : ''}{pos.unrealizedPnlPercent.toFixed(2)}%)
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-[11px] text-cyan-400/90">
                              {pos.agentOrigin}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                onClick={() => onClosePosition(pos.id)}
                                className="px-2.5 py-1 rounded text-[10px] bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-colors cursor-pointer"
                              >
                                CLOSE
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ORDER LOG */}
          {activeTab === 'ORDER_LOG' && (
            <div className="space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-cyan-500/15 text-[10px] text-slate-400 tracking-wider">
                      <th className="py-2 px-3">TIME</th>
                      <th className="py-2 px-3">ASSET</th>
                      <th className="py-2 px-3">SIDE</th>
                      <th className="py-2 px-3 text-right">PRICE</th>
                      <th className="py-2 px-3 text-right">SIZE</th>
                      <th className="py-2 px-3 text-center">CONSENSUS</th>
                      <th className="py-2 px-3">PRIMARY AGENT & RATIONALE</th>
                      <th className="py-2 px-3 text-center">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                          {ord.timestamp}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-white">
                          {ord.symbol}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              ord.side === 'BUY'
                                ? 'text-emerald-400 bg-emerald-950/60'
                                : 'text-rose-400 bg-rose-950/60'
                            }`}
                          >
                            {ord.side}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-200">
                          ${ord.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-300">
                          {ord.size}
                        </td>
                        <td className="py-2.5 px-3 text-center text-cyan-400 font-semibold">
                          {ord.consensusScore}
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-300 max-w-xs truncate">
                          <strong className="text-cyan-300">[{ord.primaryAgent}]</strong> {ord.rationale}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="text-[10px] text-emerald-400 flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {ord.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: DISCRETIONARY ORDER ENTRY */}
          {activeTab === 'NEW_ORDER' && (
            <form onSubmit={handleManualSubmit} className="max-w-xl mx-auto space-y-4 py-2">
              <div className="p-3 bg-cyan-950/30 rounded border border-cyan-500/20 text-cyan-200 text-xs">
                Manual discretionary orders inject directly into the synthetic order route, evaluated by Agent 03 (VESK) for risk tolerance before execution.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-[10px] uppercase mb-1">Asset Pair</label>
                  <select
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="w-full bg-[#081224] border border-cyan-500/30 rounded p-2 text-white font-mono focus:outline-none focus:border-cyan-400"
                  >
                    {assets.map((a) => (
                      <option key={a.symbol} value={a.symbol}>
                        {a.symbol} — ${a.price.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] uppercase mb-1">Order Side</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSide('BUY')}
                      className={`p-2 rounded font-bold transition-colors cursor-pointer ${
                        side === 'BUY'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      BUY / LONG
                    </button>
                    <button
                      type="button"
                      onClick={() => setSide('SELL')}
                      className={`p-2 rounded font-bold transition-colors cursor-pointer ${
                        side === 'SELL'
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      SELL / SHORT
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-[10px] uppercase mb-1">
                    Position Size ({symbol.split('/')[0]})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={size}
                    onChange={(e) => setSize(parseFloat(e.target.value) || 0.1)}
                    className="w-full bg-[#081224] border border-cyan-500/30 rounded p-2 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] uppercase mb-1">
                    Leverage ({leverage}x)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={leverage}
                    onChange={(e) => setLeverage(parseInt(e.target.value))}
                    className="w-full mt-2 accent-cyan-400"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#081224] rounded border border-slate-800 space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>MARK PRICE:</span>
                  <span className="text-white">${currentSelectedAsset.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>NOTIONAL VALUE:</span>
                  <span className="text-white">${(size * currentSelectedAsset.price).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-cyan-300">ESTIMATED MARGIN:</span>
                  <span className="text-cyan-300">${estimatedCost.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 rounded font-bold transition-colors cursor-pointer text-sm ${
                  side === 'BUY'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20'
                    : 'bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/20'
                }`}
              >
                DISPATCH {side} ORDER INTO SYNAPSE ROUTE
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
