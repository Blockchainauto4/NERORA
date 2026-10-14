import React, { useState } from 'react';
import { CortexTracePoint, Agent } from '../types/trading';

interface CortexTraceProps {
  tracePoints: CortexTracePoint[];
  agents: Agent[];
  selectedAgent: Agent;
  onSelectAgent: (agent: Agent) => void;
  roundNumber: number;
}

export const CortexTrace: React.FC<CortexTraceProps> = ({
  tracePoints,
  agents,
  selectedAgent,
  onSelectAgent,
  roundNumber,
}) => {
  const [activeMarker, setActiveMarker] = useState<CortexTracePoint | null>(
    tracePoints.find((p) => p.marker) || null
  );

  const svgWidth = 460;
  const svgHeight = 110;
  const paddingX = 15;
  const paddingY = 15;

  const points = tracePoints.length > 0 ? tracePoints : [];

  const getCoordinates = (p: CortexTracePoint, index: number) => {
    const x = paddingX + (index / (points.length - 1 || 1)) * (svgWidth - paddingX * 2);
    // Value is 0 to 100
    const y = svgHeight - paddingY - (p.value / 100) * (svgHeight - paddingY * 2);
    return { x, y };
  };

  const coords = points.map((p, idx) => getCoordinates(p, idx));

  // Construct zigzag / erratic trace path
  let pathStr = '';
  if (coords.length > 0) {
    pathStr = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      pathStr += ` L ${coords[i].x} ${coords[i].y}`;
    }
  }

  return (
    <div className="p-3.5 rounded-lg bg-[#070f1f]/85 border border-cyan-500/20 flex flex-col justify-between h-[230px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-cyan-500/10">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="font-semibold text-white">04 / CORTEX TRACE</span>
          <span className="text-slate-600">·</span>
          <span className="text-cyan-400">THE POINTS WHERE THE MODEL MOVED</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          OSCILLATION: <strong className="text-cyan-300">NOMINAL</strong>
        </span>
      </div>

      {/* SVG Trace Line & Triangular Markers */}
      <div className="relative w-full h-[95px] mt-1">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          {/* Baseline indicator */}
          <line
            x1="0"
            y1={svgHeight / 2}
            x2={svgWidth}
            y2={svgHeight / 2}
            stroke="rgba(56, 189, 248, 0.12)"
            strokeDasharray="4 4"
          />

          {/* Trace stroke */}
          {pathStr && (
            <path
              d={pathStr}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          )}

          {/* Render markers (little inverted triangles) */}
          {coords.map((c, i) => {
            const p = points[i];
            if (!p.marker) return null;

            const isCurrent = activeMarker?.id === p.id;

            return (
              <g
                key={p.id}
                className="cursor-pointer"
                onClick={() => setActiveMarker(p)}
              >
                {/* Vertical drop line */}
                <line
                  x1={c.x}
                  y1={c.y}
                  x2={c.x}
                  y2={15}
                  stroke={isCurrent ? '#38bdf8' : 'rgba(148, 163, 184, 0.4)'}
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />

                {/* Triangular pin marker */}
                <polygon
                  points={`${c.x - 4},15 ${c.x + 4},15 ${c.x},22`}
                  fill={isCurrent ? '#38bdf8' : '#f59e0b'}
                />

                {/* Pulsing point on line */}
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={isCurrent ? 3.5 : 2}
                  fill={isCurrent ? '#ffffff' : '#38bdf8'}
                />
              </g>
            );
          })}
        </svg>

        {/* Selected Marker Callout */}
        {activeMarker && activeMarker.marker ? (
          <div className="absolute top-1 left-2 max-w-[85%] text-[10px] font-mono p-1 rounded bg-[#091326]/90 border border-cyan-500/30 text-slate-200">
            <span className="text-cyan-400 font-bold">[{activeMarker.marker.agent}]</span>{' '}
            <span className="text-amber-300 font-semibold">{activeMarker.marker.label}:</span>{' '}
            <span className="text-slate-300">{activeMarker.marker.details}</span>
          </div>
        ) : (
          <div className="absolute top-1 left-2 text-[10px] font-mono text-slate-500">
            SELECT A MARKER (OR AN ACTION STREAM EVENT) TO READ IT HERE
          </div>
        )}
      </div>

      {/* ACTIVE ROUTE PIPELINE STRIP (Directly from bottom of screenshot) */}
      <div className="pt-2 border-t border-cyan-500/15">
        <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-mono">
          <span className="text-cyan-400 font-bold whitespace-nowrap">● ACTIVE ROUTE:</span>
          {agents.map((ag, idx) => {
            const isSel = ag.id === selectedAgent.id;
            return (
              <React.Fragment key={ag.id}>
                <button
                  onClick={() => onSelectAgent(ag)}
                  className={`px-1.5 py-0.5 rounded transition-all cursor-pointer whitespace-nowrap ${
                    isSel
                      ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400 font-bold'
                      : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {ag.name}
                </button>
                {idx < agents.length - 1 && <span className="text-slate-600">➔</span>}
              </React.Fragment>
            );
          })}
          <span className="text-slate-600">➔</span>
          <span className="text-cyan-300/80">LOOP</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400">ROUND {roundNumber}</span>
        </div>
      </div>
    </div>
  );
};
