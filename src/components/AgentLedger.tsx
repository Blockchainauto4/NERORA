import React from 'react';
import { Agent } from '../types/trading';
import { Shield, Sparkles, Eye, Zap, Layers, Network } from 'lucide-react';

interface AgentLedgerProps {
  agents: Agent[];
  selectedAgent: Agent;
  onSelectAgent: (agent: Agent) => void;
}

export const AgentLedger: React.FC<AgentLedgerProps> = ({
  agents,
  selectedAgent,
  onSelectAgent,
}) => {
  const getAgentIcon = (id: string) => {
    switch (id) {
      case 'agent-nova':
        return <Sparkles className="w-3.5 h-3.5 text-cyan-400" />;
      case 'agent-orin':
        return <Eye className="w-3.5 h-3.5 text-cyan-400" />;
      case 'agent-vesk':
        return <Shield className="w-3.5 h-3.5 text-purple-400" />;
      case 'agent-luma':
        return <Layers className="w-3.5 h-3.5 text-blue-400" />;
      case 'agent-kira':
        return <Network className="w-3.5 h-3.5 text-teal-400" />;
      case 'agent-dash':
        return <Zap className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <Zap className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* SECTION KICKER / HEADER (Directly from screenshot) */}
      <div className="flex items-center justify-between text-xs font-mono tracking-wider">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="text-cyan-400 font-semibold">THE SIX</span>
          <span className="text-slate-600">/</span>
          <span className="text-white font-medium">AGENT LEDGER</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400 hidden sm:inline">EACH AGENT, ONE ROLE. SHARED INTELLIGENCE.</span>
        </div>
        <div className="text-[11px] text-slate-400 hidden md:block">
          STATUS: <span className="text-emerald-400 font-semibold">SYNCHRONIZED (6/6)</span>
        </div>
      </div>

      {/* HORIZONTAL CARDS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {agents.map((agent) => {
          const isSelected = agent.id === selectedAgent.id;
          const isPositive = agent.outputSim >= 0;

          return (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(agent)}
              className={`relative text-left p-3 rounded-lg transition-all duration-200 border cursor-pointer ${
                isSelected
                  ? 'bg-[#0b172e] border-cyan-400/80 shadow-[0_0_20px_-3px_rgba(6,182,212,0.35)]'
                  : 'bg-[#081022]/80 hover:bg-[#0c1630] border-cyan-500/15 hover:border-cyan-500/35'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span className="text-slate-400 font-semibold">AGENT {agent.number}</span>
                <span className="flex items-center gap-1 text-[9px] text-cyan-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  {agent.route}
                </span>
              </div>

              {/* Agent Name & Icon */}
              <div className="flex items-center gap-1.5 mt-0.5">
                {getAgentIcon(agent.id)}
                <span className="text-sm font-mono font-bold text-white tracking-wide">
                  {agent.name}
                </span>
              </div>

              {/* Role Title */}
              <div className="text-[11px] font-medium text-cyan-300/90 truncate mt-0.5">
                {agent.role}
              </div>

              {/* Description preview */}
              <p className="text-[10px] text-slate-400 line-clamp-2 mt-1.5 h-7 leading-relaxed">
                {agent.description}
              </p>

              {/* Output & Utilization Metrics */}
              <div className="mt-3 pt-2 border-t border-slate-800/80 space-y-1 font-mono">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">OUTPUT · SIM</span>
                  <span
                    className={`font-bold ${
                      isPositive ? 'text-cyan-300' : 'text-purple-400'
                    }`}
                  >
                    {isPositive ? `+` : ``}
                    {agent.outputSim.toLocaleString('en-US')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">UTILIZATION</span>
                  <span className="text-white font-semibold">{agent.utilization}%</span>
                </div>

                {/* Neon progress bar */}
                <div className="w-full h-1 bg-slate-800 rounded overflow-hidden mt-1">
                  <div
                    className="h-full rounded transition-all duration-500"
                    style={{
                      width: `${agent.utilization}%`,
                      backgroundColor: agent.color,
                      boxShadow: `0 0 8px ${agent.color}`,
                    }}
                  />
                </div>
              </div>

              {/* Selected indicator corner */}
              {isSelected && (
                <div className="absolute top-0 right-0 w-2.5 h-2.5 overflow-hidden">
                  <div className="absolute transform rotate-45 bg-cyan-400 w-3 h-3 -top-1.5 -right-1.5" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
