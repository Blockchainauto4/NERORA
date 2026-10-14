import React, { useState } from 'react';
import { EquityPoint } from '../types/trading';

interface OutputChartProps {
  equitySeries: EquityPoint[];
  combinedOutput: number;
  baseBalance: number;
  activeAgentsCount: number;
}

export const OutputChart: React.FC<OutputChartProps> = ({
  equitySeries,
  combinedOutput,
  baseBalance,
  activeAgentsCount,
}) => {
  const [timeframe, setTimeframe] = useState<'1M' | '5M' | '15M' | 'ALL'>('5M');
  const [hoveredPoint, setHoveredPoint] = useState<EquityPoint | null>(null);

  // Generate SVG path for equity curve
  const points = equitySeries.length > 0 ? equitySeries : [];
  const minEquity = Math.min(...points.map((p) => p.equity), baseBalance);
  const maxEquity = Math.max(...points.map((p) => p.equity), baseBalance + combinedOutput);
  const range = maxEquity - minEquity || 1;

  const svgWidth = 460;
  const svgHeight = 140;
  const paddingX = 15;
  const paddingY = 15;

  const getCoordinates = (p: EquityPoint, index: number) => {
    const x = paddingX + (index / (points.length - 1 || 1)) * (svgWidth - paddingX * 2);
    const normalizedY = (p.equity - minEquity) / range;
    const y = svgHeight - paddingY - normalizedY * (svgHeight - paddingY * 2);
    return { x, y };
  };

  const polylineCoords = points.map((p, idx) => getCoordinates(p, idx));

  // Construct SVG path string
  let linePath = '';
  if (polylineCoords.length > 0) {
    linePath = `M ${polylineCoords[0].x} ${polylineCoords[0].y}`;
    for (let i = 1; i < polylineCoords.length; i++) {
      // Smooth curve
      const prev = polylineCoords[i - 1];
      const cur = polylineCoords[i];
      const midX = (prev.x + cur.x) / 2;
      linePath += ` C ${midX} ${prev.y}, ${midX} ${cur.y}, ${cur.x} ${cur.y}`;
    }
  }

  // Area path closing at bottom
  const areaPath = polylineCoords.length > 0
    ? `${linePath} L ${polylineCoords[polylineCoords.length - 1].x} ${svgHeight} L ${polylineCoords[0].x} ${svgHeight} Z`
    : '';

  const sessionOpenGain = points[0]?.netChange || 10034;
  const lastGain = points[points.length - 1]?.netChange || combinedOutput;
  const net5m = lastGain - sessionOpenGain;

  return (
    <div className="p-3.5 rounded-lg bg-[#070f1f]/85 border border-cyan-500/20 flex flex-col justify-between h-[230px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-cyan-500/10">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="font-semibold text-white">03 / COMBINED OUTPUT</span>
          <span className="text-slate-600">·</span>
          <span className="text-cyan-400">SYSTEM-WIDE</span>
        </div>

        {/* Timeframe selector (1M, 5M, 15M, ALL matching screenshot) */}
        <div className="flex items-center gap-1 font-mono text-[10px]">
          {(['1M', '5M', '15M', 'ALL'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                timeframe === tf
                  ? 'bg-cyan-500/25 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="flex flex-wrap items-baseline justify-between mt-2 font-mono">
        <div>
          <span className="text-2xl font-bold text-white tracking-tight">
            +${Math.round(combinedOutput).toLocaleString('en-US')}
          </span>
          <span className="text-[10px] text-cyan-400/80 ml-2">SIMULATED NET ALPHA</span>
        </div>

        <div className="flex items-center gap-4 text-[10px] text-slate-400">
          <div>
            <span>SESSION OPEN </span>
            <span className="text-slate-200 font-semibold">+${Math.round(sessionOpenGain).toLocaleString('en-US')}</span>
          </div>
          <div>
            <span>NET 5M </span>
            <span className="text-cyan-300 font-semibold">+${Math.round(net5m).toLocaleString('en-US')}</span>
          </div>
          <div>
            <span>ACTIVE AGENTS </span>
            <span className="text-emerald-400 font-semibold">0{activeAgentsCount} / 06</span>
          </div>
        </div>
      </div>

      {/* SVG Interactive Chart */}
      <div className="relative w-full h-[120px] mt-1">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1={svgHeight * 0.25} x2={svgWidth} y2={svgHeight * 0.25} stroke="rgba(56, 189, 248, 0.08)" strokeDasharray="3 3" />
          <line x1="0" y1={svgHeight * 0.5} x2={svgWidth} y2={svgHeight * 0.5} stroke="rgba(56, 189, 248, 0.08)" strokeDasharray="3 3" />
          <line x1="0" y1={svgHeight * 0.75} x2={svgWidth} y2={svgHeight * 0.75} stroke="rgba(56, 189, 248, 0.08)" strokeDasharray="3 3" />

          {/* Fill Area */}
          {areaPath && <path d={areaPath} fill="url(#equityGrad)" />}

          {/* Glowing Stroke Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.2"
              filter="url(#glowCyan)"
            />
          )}

          {/* Points */}
          {polylineCoords.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={i === polylineCoords.length - 1 ? 4 : 2}
              fill={i === polylineCoords.length - 1 ? '#ffffff' : '#38bdf8'}
              stroke="#070f1f"
              strokeWidth="1.5"
              className="cursor-pointer hover:r-4 transition-all"
              onMouseEnter={() => setHoveredPoint(points[i])}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>

        {/* Hover detail tooltip */}
        {hoveredPoint && (
          <div className="absolute top-0 right-2 p-1.5 rounded bg-slate-900/90 border border-cyan-400 text-[10px] font-mono text-white shadow-lg pointer-events-none">
            <div>TIME: {hoveredPoint.timeStr}</div>
            <div className="text-cyan-300 font-bold">
              EQUITY: ${hoveredPoint.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-emerald-400">
              NET GAIN: +${hoveredPoint.netChange.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom X-axis timestamps */}
      <div className="flex justify-between text-[9px] font-mono text-slate-500 pt-1 border-t border-slate-800/60">
        <span>12:24:14</span>
        <span>12:26:44</span>
        <span>12:29:14</span>
      </div>
    </div>
  );
};
