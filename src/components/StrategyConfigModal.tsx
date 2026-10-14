import React from 'react';
import { Agent, SystemMetrics } from '../types/trading';
import { X, ShieldAlert, Sliders, RotateCcw, Check, Sparkles } from 'lucide-react';

interface StrategyConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: Agent[];
  metrics: SystemMetrics;
  consensusThreshold: number;
  onChangeConsensusThreshold: (threshold: number) => void;
  maxDrawdownLimit: number;
  onChangeMaxDrawdownLimit: (limit: number) => void;
  onResetSimulation: () => void;
  onToggleAgentActive: (agentId: string) => void;
}

export const StrategyConfigModal: React.FC<StrategyConfigModalProps> = ({
  isOpen,
  onClose,
  agents,
  metrics,
  consensusThreshold,
  onChangeConsensusThreshold,
  maxDrawdownLimit,
  onChangeMaxDrawdownLimit,
  onResetSimulation,
  onToggleAgentActive,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-[#070e1c] border border-cyan-500/30 rounded-xl shadow-2xl overflow-hidden flex flex-col font-mono text-xs">
        {/* Header */}
        <div className="px-5 py-4 border-b border-cyan-500/20 flex items-center justify-between bg-[#040813]">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white tracking-wide">
              SYNAPTIC STRATEGY & RISK ARCHITECTURE
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Section 1: Consensus Quorum */}
          <div className="p-3.5 bg-[#081224] rounded-lg border border-cyan-500/15 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white font-bold">AGENT CONSENSUS QUORUM</span>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                  Minimum number of agents required to reach synthetic convergence before order dispatch.
                </p>
              </div>
              <span className="px-2 py-1 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/30">
                {consensusThreshold} / 6 AGENTS
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              {[3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  onClick={() => onChangeConsensusThreshold(num)}
                  className={`flex-1 py-1.5 rounded transition-all cursor-pointer ${
                    consensusThreshold === num
                      ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {num} OF 6 {num === 5 ? '(RECOMMENDED)' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Max Drawdown Armor (VESK protocol) */}
          <div className="p-3.5 bg-[#081224] rounded-lg border border-purple-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-purple-400" />
                <span className="text-white font-bold">VESK DRAWDOWN ARMOR</span>
              </div>
              <span className="px-2 py-1 rounded bg-purple-950 text-purple-300 font-bold border border-purple-500/30">
                {maxDrawdownLimit}% MAX DROP
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans">
              Automatically triggers delta-hedging shorts or closes high-risk exposures if rolling synthetic drawdown reaches this threshold.
            </p>
            <input
              type="range"
              min="2"
              max="15"
              step="1"
              value={maxDrawdownLimit}
              onChange={(e) => onChangeMaxDrawdownLimit(parseInt(e.target.value))}
              className="w-full accent-purple-400 mt-2"
            />
          </div>

          {/* Section 3: Agent Enable/Disable Matrix */}
          <div className="p-3.5 bg-[#081224] rounded-lg border border-cyan-500/15 space-y-2">
            <span className="text-white font-bold">THE SIX · NEURAL ENGINES ACTIVE STATE</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {agents.map((ag) => (
                <button
                  key={ag.id}
                  onClick={() => onToggleAgentActive(ag.id)}
                  className={`p-2 rounded text-left border transition-all cursor-pointer flex items-center justify-between ${
                    ag.active
                      ? 'bg-cyan-950/40 border-cyan-500/40 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-500'
                  }`}
                >
                  <div>
                    <div className="font-bold">{ag.number} · {ag.name}</div>
                    <div className="text-[9px] text-slate-400 font-sans truncate">{ag.role}</div>
                  </div>
                  <div className={`w-3.5 h-3.5 rounded flex items-center justify-center ${ag.active ? 'bg-cyan-400 text-black' : 'bg-slate-700'}`}>
                    {ag.active && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Reset Simulation */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <div>
              <span className="text-slate-300 font-bold">SIMULATION LEDGER RESET</span>
              <p className="text-[10px] text-slate-500">Restore ledger to baseline $50,000.00 and clear positions.</p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Reset synthetic ledger to base $50,000.00?')) {
                  onResetSimulation();
                  onClose();
                }
              }}
              className="px-3 py-1.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET LEDGER</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
