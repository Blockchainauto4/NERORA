import React from 'react';
import { SystemMetrics, MarketAsset } from '../types/trading';
import {
  Activity,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sliders,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Sparkles,
} from 'lucide-react';

interface HeaderBarProps {
  metrics: SystemMetrics;
  isAutoTrading: boolean;
  onToggleAutoTrading: () => void;
  simSpeed: number;
  onChangeSimSpeed: (speed: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  activeAsset: MarketAsset;
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  onOpenPositionsModal: () => void;
  onOpenStrategyModal: () => void;
  onOpenManualTradeModal: () => void;
  onOpenTextureModal: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  metrics,
  isAutoTrading,
  onToggleAutoTrading,
  simSpeed,
  onChangeSimSpeed,
  isMuted,
  onToggleMute,
  activeAsset,
  assets,
  onSelectAsset,
  onOpenPositionsModal,
  onOpenStrategyModal,
  onOpenManualTradeModal,
  onOpenTextureModal,
}) => {
  return (
    <header className="w-full bg-[#050a16]/90 border-b border-cyan-500/20 text-white backdrop-blur-md relative z-30">
      {/* TOP ROW: Brand Mark & Main KPIs (Exact match to screenshot) */}
      <div className="max-w-[1720px] mx-auto px-4 py-3 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-md bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <div className="w-full h-full bg-[#070e1c] rounded-sm flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono text-base font-extrabold tracking-widest text-white uppercase">
                NEXORA
              </h1>
              <span className="text-slate-600 font-mono">|</span>
              <span className="font-mono text-xs font-semibold tracking-wider text-cyan-400">
                SYNAPTIC CONTROL
              </span>
            </div>
            <div className="text-[10px] font-mono tracking-wider text-slate-400 mt-0.5">
              SIX AGENTS · ONE SHARED INTELLIGENCE
            </div>
          </div>
        </div>

        {/* THREE PRIMARY KPI CARDS (Matches top right of screenshot) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
          {/* Card 1: System Balance */}
          <div className="px-3.5 py-2 rounded-lg bg-[#081224]/90 border border-cyan-500/20 font-mono relative overflow-hidden">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">
              SYSTEM BALANCE <span className="text-cyan-400">[SIM]</span>
            </div>
            <div className="text-lg lg:text-xl font-bold text-white tracking-tight mt-0.5">
              ${metrics.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5">
              BASE ${metrics.baseBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} · SYNTHETIC LEDGER
            </div>
          </div>

          {/* Card 2: Combined Output */}
          <div className="px-3.5 py-2 rounded-lg bg-[#081224]/90 border border-cyan-500/20 font-mono relative overflow-hidden">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">
              COMBINED OUTPUT <span className="text-cyan-400">[SIM]</span>
            </div>
            <div className="text-lg lg:text-xl font-bold text-cyan-300 tracking-tight mt-0.5 flex items-center gap-1">
              <span>+${metrics.combinedOutput.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="text-[9px] text-emerald-400 mt-0.5">
              +{metrics.returnPercent.toFixed(2)}% ON BASE · SIX-AGENT SUM
            </div>
          </div>

          {/* Card 3: Decision Accuracy */}
          <div className="px-3.5 py-2 rounded-lg bg-[#081224]/90 border border-cyan-500/20 font-mono relative overflow-hidden">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">
              DECISION ACCURACY
            </div>
            <div className="text-lg lg:text-xl font-bold text-white tracking-tight mt-0.5">
              {metrics.decisionAccuracy.toFixed(1)}%
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5">
              ROLLING {metrics.totalDecisions} SYNTHETIC DECISIONS
            </div>
          </div>
        </div>

        {/* Quick Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleAutoTrading}
            className={`px-3 py-2 rounded-md font-mono text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              isAutoTrading
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-amber-500/20 text-amber-300 border border-amber-400/50'
            }`}
          >
            {isAutoTrading ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>AUTO-EXEC: ACTIVE</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>AUTO-EXEC: PAUSED</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenManualTradeModal}
            className="px-3 py-2 rounded-md font-mono text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ORDER DESK</span>
          </button>

          <button
            onClick={onOpenTextureModal}
            className="px-2.5 py-2 rounded-md bg-[#081224] hover:bg-[#0d1a33] border border-cyan-500/30 text-cyan-300 hover:text-cyan-100 flex items-center gap-1.5 text-xs font-mono transition-colors cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.15)]"
            title="Atmosphere & Texture Engine (Cosmic Backdrop, Grain, Scanlines)"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">TEXTURE</span>
          </button>

          <button
            onClick={onOpenStrategyModal}
            className="p-2 rounded-md bg-[#081224] hover:bg-[#0d1a33] border border-cyan-500/20 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
            title="Algorithm & Risk Configurations"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleMute}
            className="p-2 rounded-md bg-[#081224] hover:bg-[#0d1a33] border border-cyan-500/20 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Audio Feedback' : 'Mute Audio Feedback'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* SUB-HEADER TELEMETRY STRIP (Matches the exact telemetry ribbon from screenshot) */}
      <div className="bg-[#03060f] border-t border-cyan-500/10 px-4 py-1.5">
        <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono text-slate-400">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="text-cyan-400 font-bold">SIGNAL BUS:</span>
              <span className="text-slate-200">SIGNAL STREAM: ACTIVE</span>
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1">
              <span>PROCESSING RATE:</span>
              <span className="text-cyan-300 font-semibold">{metrics.eventRate.toLocaleString()} EVENTS/S</span>
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1">
              <span>NETWORK LATENCY:</span>
              <span className="text-emerald-400 font-semibold">0{metrics.latencyMs} MS</span>
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1">
              <span>AGENT CONSENSUS:</span>
              <span className="text-cyan-300 font-bold">
                {metrics.agentConsensusActive} / {metrics.agentConsensusTotal}
              </span>
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400 font-semibold">EVENT BUS: CONNECTED</span>
          </div>

          {/* Right side: Simulation Speed & Market Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-slate-500">SPEED:</span>
              {[1, 2, 5, 10].map((s) => (
                <button
                  key={s}
                  onClick={() => onChangeSimSpeed(s)}
                  className={`px-1.5 py-0.5 rounded text-[9px] transition-colors cursor-pointer ${
                    simSpeed === s
                      ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400 font-bold'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            <span className="text-slate-600">|</span>

            {/* Asset quick switch */}
            <div className="flex items-center gap-1">
              {assets.map((ast) => (
                <button
                  key={ast.symbol}
                  onClick={() => onSelectAsset(ast)}
                  className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                    activeAsset.symbol === ast.symbol
                      ? 'bg-blue-600/30 text-white border border-blue-400/60 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {ast.symbol.split('/')[0]}
                  <span className={`ml-1 text-[9px] ${ast.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ${ast.price.toLocaleString('en-US', { maximumFractionDigits: 1 })}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
