import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Agent, SystemMetrics } from '../types/trading';
import { Maximize2, RotateCcw, Zap, Compass, Activity, Shield, Sparkles } from 'lucide-react';

interface SynapticVortexProps {
  agents: Agent[];
  selectedAgent: Agent;
  onSelectAgent: (agent: Agent) => void;
  metrics: SystemMetrics;
  onUpdateAgentAllocation?: (agentId: string, delta: number) => void;
}

interface Particle3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  baseRadius: number;
  angle: number;
  speed: number;
  height: number;
  color: string;
  alpha: number;
  isNode?: boolean;
  nodeLabel?: string;
  agentRef?: Agent;
}

export const SynapticVortex: React.FC<SynapticVortexProps> = ({
  agents,
  selectedAgent,
  onSelectAgent,
  metrics,
  onUpdateAgentAllocation,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Camera state
  const [yaw, setYaw] = useState<number>(5.91);
  const [pitch, setPitch] = useState<number>(0.12);
  const [zoom, setZoom] = useState<number>(1.25);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; yaw: number; pitch: number }>({ x: 0, y: 0, yaw: 5.91, pitch: 0.12 });

  // Field display modes
  const [fieldMode, setFieldMode] = useState<'vortex' | 'mesh' | 'depth'>('vortex');
  const [inspectorTab, setInspectorTab] = useState<'PROFILE' | 'LINKS' | 'LOG'>('PROFILE');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Particles storage
  const particlesRef = useRef<Particle3D[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Initialize 3D particles, cosmic stardust & agent nodes
  useEffect(() => {
    const particles: Particle3D[] = [];
    const particleCount = 320;

    // Standard vortex particles & fine stardust
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const baseRadius = 30 + Math.pow(Math.random(), 1.4) * 280;
      const height = (Math.random() - 0.5) * 180;
      const speed = 0.007 + (320 - baseRadius) * 0.00007;

      const colors = [
        '#38bdf8', // sky-400
        '#06b6d4', // cyan-500
        '#60a5fa', // blue-400
        '#93c5fd', // light cyan
        '#c084fc', // purple
        '#34d399', // emerald stardust
        '#f8fafc', // pure stellar white
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];

      particles.push({
        x: Math.cos(angle) * baseRadius,
        y: height,
        z: Math.sin(angle) * baseRadius,
        vx: 0,
        vy: 0,
        vz: 0,
        size: Math.random() < 0.2 ? Math.random() * 2.8 + 1.2 : Math.random() * 1.5 + 0.6,
        baseRadius,
        angle,
        speed,
        height,
        color,
        alpha: Math.random() * 0.75 + 0.25,
      });
    }

    // Agent Nodes (the 6 main agents placed strategically in the 3D synaptic field)
    agents.forEach((agent, idx) => {
      const angle = (idx / agents.length) * Math.PI * 2 + 0.4;
      const baseRadius = 150 + (idx % 2 === 0 ? 30 : -20);
      const height = ((idx % 3) - 1) * 45;

      particles.push({
        x: Math.cos(angle) * baseRadius,
        y: height,
        z: Math.sin(angle) * baseRadius,
        vx: 0,
        vy: 0,
        vz: 0,
        size: 6.0,
        baseRadius,
        angle,
        speed: 0.004,
        height,
        color: agent.color,
        alpha: 1.0,
        isNode: true,
        nodeLabel: `${agent.number} · ${agent.name}`,
        agentRef: agent,
      });
    });

    particlesRef.current = particles;
  }, [agents]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localYaw = yaw;
    let localPitch = pitch;
    let localZoom = zoom;

    const render = () => {
      // Auto-resize canvas to match container exactly
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
      }

      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Deep cyber background gradient inside the vortex chamber
      const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(width, height) * 0.6);
      bgGrad.addColorStop(0, 'rgba(12, 28, 55, 0.45)');
      bgGrad.addColorStop(0.5, 'rgba(8, 17, 34, 0.65)');
      bgGrad.addColorStop(1, 'rgba(4, 8, 18, 0.95)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle cyber grid coordinate lines in 3D floor
      const gridRings = [60, 130, 210, 290];
      gridRings.forEach((r) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r * (localZoom * 0.7), 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Camera rotation angles
      const cosYaw = Math.cos(localYaw);
      const sinYaw = Math.sin(localYaw);
      const cosPitch = Math.cos(localPitch);
      const sinPitch = Math.sin(localPitch);

      // 3D projection parameters
      const fov = 420 * localZoom;

      const projectedPoints: {
        px: number;
        py: number;
        pDepth: number;
        p: Particle3D;
      }[] = [];

      // Update particle physics & project
      const angVel = metrics.angularVelocity;
      const axialStretch = metrics.axialStretch;

      particlesRef.current.forEach((p) => {
        // Move along spiral
        p.angle += p.speed * (angVel / 2.8);

        let curR = p.baseRadius;
        let curY = p.height * axialStretch;

        if (fieldMode === 'vortex') {
          // Dynamic inward vortex swirl
          p.x = Math.cos(p.angle) * curR;
          p.z = Math.sin(p.angle) * curR;
          p.y = curY + Math.sin(p.angle * 3 + Date.now() * 0.002) * 12;
        } else if (fieldMode === 'mesh') {
          // Flattened lattice
          p.x = Math.cos(p.angle) * (curR * 1.2);
          p.z = Math.sin(p.angle) * (curR * 1.2);
          p.y = Math.cos(p.angle * 2) * 25;
        } else {
          // Vertical Order Flow Depth columns
          p.x = Math.cos(p.angle) * curR;
          p.z = Math.sin(p.angle) * curR;
          p.y = curY * 1.8;
        }

        // Apply 3D rotation: Yaw (around Y), Pitch (around X)
        // 1. Yaw rotation
        const x1 = p.x * cosYaw - p.z * sinYaw;
        const z1 = p.x * sinYaw + p.z * cosYaw;
        const y1 = p.y;

        // 2. Pitch rotation
        const y2 = y1 * cosPitch - z1 * sinPitch;
        const z2 = y1 * sinPitch + z1 * cosPitch;
        const x2 = x1;

        // Perspective division
        const cameraDistance = 380;
        const distanceZ = cameraDistance + z2;

        if (distanceZ > 20) {
          const scale = fov / distanceZ;
          const px = cx + x2 * scale;
          const py = cy + y2 * scale;

          projectedPoints.push({
            px,
            py,
            pDepth: distanceZ,
            p,
          });
        }
      });

      // Sort by depth (painter's algorithm)
      projectedPoints.sort((a, b) => b.pDepth - a.pDepth);

      // Draw Synaptic Connecting Lines between close nodes & center
      const agentNodes = projectedPoints.filter((pt) => pt.p.isNode);

      // Draw central synaptic core beam
      ctx.beginPath();
      ctx.moveTo(cx, cy - 80 * localZoom);
      ctx.lineTo(cx, cy + 80 * localZoom);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Connect agent nodes to one another forming synaptic mesh
      for (let i = 0; i < agentNodes.length; i++) {
        const next = agentNodes[(i + 1) % agentNodes.length];
        const isSelectedLink =
          agentNodes[i].p.agentRef?.id === selectedAgent.id ||
          next.p.agentRef?.id === selectedAgent.id;

        ctx.beginPath();
        ctx.moveTo(agentNodes[i].px, agentNodes[i].py);
        ctx.bezierCurveTo(
          (agentNodes[i].px + next.px) / 2 + (Math.sin(Date.now() * 0.003 + i) * 20),
          (agentNodes[i].py + next.py) / 2 - 15,
          (agentNodes[i].px + next.px) / 2,
          (agentNodes[i].py + next.py) / 2,
          next.px,
          next.py
        );

        ctx.strokeStyle = isSelectedLink
          ? 'rgba(56, 189, 248, 0.55)'
          : 'rgba(56, 189, 248, 0.15)';
        ctx.lineWidth = isSelectedLink ? 1.8 : 0.8;
        ctx.stroke();
      }

      // Draw glowing particles
      projectedPoints.forEach(({ px, py, pDepth, p }) => {
        const alphaFade = Math.max(0.1, Math.min(1, 450 / pDepth));

        if (p.isNode) {
          // Prominent Agent Node
          const isSelected = p.agentRef?.id === selectedAgent.id;
          const nodeRadius = isSelected ? 8.5 : 5.5;

          // Glowing aura
          const auraGrad = ctx.createRadialGradient(px, py, 1, px, py, nodeRadius * 3);
          auraGrad.addColorStop(0, p.color);
          auraGrad.addColorStop(0.4, p.color + '44');
          auraGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = auraGrad;
          ctx.beginPath();
          ctx.arc(px, py, nodeRadius * 3, 0, Math.PI * 2);
          ctx.fill();

          // Outer ring
          ctx.beginPath();
          ctx.arc(px, py, nodeRadius + 3, 0, Math.PI * 2);
          ctx.strokeStyle = isSelected ? '#ffffff' : p.color;
          ctx.lineWidth = isSelected ? 2 : 1.2;
          ctx.stroke();

          // Core point
          ctx.beginPath();
          ctx.arc(px, py, nodeRadius, 0, Math.PI * 2);
          ctx.fillStyle = isSelected ? '#ffffff' : p.color;
          ctx.fill();

          // Text label
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillStyle = isSelected ? '#38bdf8' : '#94a3b8';
          ctx.fillText(p.nodeLabel || '', px + 12, py + 3);
        } else {
          // Standard Synaptic Particle
          ctx.beginPath();
          ctx.arc(px, py, p.size * (350 / pDepth), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha * alphaFade;
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [yaw, pitch, zoom, fieldMode, selectedAgent, metrics]);

  // Mouse drag handlers for 3D Camera Orbit
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      yaw,
      pitch,
    };
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    const newYaw = dragStartRef.current.yaw + dx * 0.008;
    const newPitch = Math.max(-1.1, Math.min(1.1, dragStartRef.current.pitch + dy * 0.008));

    setYaw(newYaw);
    setPitch(newPitch);
  }, [isDragging]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * -0.001;
    setZoom((prev) => Math.max(0.6, Math.min(2.4, prev + zoomDelta)));
  };

  // Reset 3D view
  const handleResetView = () => {
    setYaw(5.91);
    setPitch(0.12);
    setZoom(1.25);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[480px] lg:h-[530px] rounded-lg overflow-hidden border border-cyan-500/20 bg-[#050914] select-none"
    >
      {/* 3D Canvas element */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* TOP-LEFT TITLE & TELEMETRY STRIP (Identical to screenshot) */}
      <div className="absolute top-3 left-4 z-10 pointer-events-none">
        <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-cyan-400">
          <span className="font-semibold text-white">01 / THE VORTEX</span>
          <span className="text-slate-500">·</span>
          <span className="text-cyan-300/80">INWARD SPIRAL / SYNAPTIC FIELD</span>
          <span className="text-slate-500">·</span>
          <span className="inline-flex items-center gap-1.5 text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            {metrics.activeField}
          </span>
        </div>

        {/* Physics telemetry box matching screenshot */}
        <div className="mt-2.5 p-2.5 rounded bg-[#091122]/85 border border-cyan-500/20 backdrop-blur-md space-y-1.5 w-44 font-mono pointer-events-auto">
          <div className="flex justify-between items-center text-[10px] text-slate-400">
            <span>ANGULAR VELOCITY</span>
            <span className="text-cyan-300 font-semibold">{metrics.angularVelocity.toFixed(2)} RAD/S</span>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400">
            <span>AXIAL STRETCH</span>
            <span className="text-cyan-300 font-semibold">{metrics.axialStretch.toFixed(2)} X · CON</span>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400">
            <span>COHERENCE</span>
            <span className="text-emerald-400 font-semibold">{metrics.coherence.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* TOP-RIGHT VIEW CONTROLS */}
      <div className="absolute top-3 right-4 z-10 flex items-center gap-1.5 bg-[#091122]/85 p-1 rounded border border-cyan-500/20 backdrop-blur-md">
        <button
          onClick={() => setFieldMode('vortex')}
          className={`px-2 py-1 text-[11px] font-mono rounded transition-colors ${
            fieldMode === 'vortex'
              ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Inward Logarithmic Vortex"
        >
          VORTEX
        </button>
        <button
          onClick={() => setFieldMode('mesh')}
          className={`px-2 py-1 text-[11px] font-mono rounded transition-colors ${
            fieldMode === 'mesh'
              ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Synaptic Neural Mesh"
        >
          MESH
        </button>
        <button
          onClick={() => setFieldMode('depth')}
          className={`px-2 py-1 text-[11px] font-mono rounded transition-colors ${
            fieldMode === 'depth'
              ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Order Flow Depth Columns"
        >
          DEPTH 3D
        </button>
        <button
          onClick={handleResetView}
          className="p-1 text-slate-400 hover:text-cyan-300 transition-colors ml-1"
          title="Reset Camera View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* FLOATING AGENT INSPECTOR (Exact placement from screenshot: Agent 01 NOVA Current Active) */}
      <div className="absolute left-4 bottom-14 z-10 w-72 sm:w-80 p-3 rounded-lg bg-[#081020]/90 border border-cyan-500/30 backdrop-blur-md shadow-2xl">
        <div className="flex items-center justify-between pb-2 border-b border-cyan-500/15">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: selectedAgent.color }}
            />
            <span className="font-mono text-xs font-bold text-white tracking-wide">
              {selectedAgent.number} · {selectedAgent.name}
            </span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
            CURRENT AGENT ACTIVE
          </span>
        </div>

        {/* Tab switcher: PROFILE / LINKS / LOG */}
        <div className="flex items-center gap-4 mt-2 border-b border-slate-800 text-[11px] font-mono">
          {(['PROFILE', 'LINKS', 'LOG'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setInspectorTab(tab)}
              className={`pb-1 transition-colors ${
                inspectorTab === tab
                  ? 'text-cyan-300 border-b-2 border-cyan-400 font-semibold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-2.5 space-y-2 font-mono text-[11px]">
          {inspectorTab === 'PROFILE' && (
            <>
              <div className="flex justify-between items-center text-slate-400">
                <span>ROLE</span>
                <span className="text-slate-200 font-sans text-xs">{selectedAgent.role}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>OUTPUT · SIM</span>
                <span
                  className={`font-semibold ${
                    selectedAgent.outputSim >= 0 ? 'text-cyan-300' : 'text-purple-400'
                  }`}
                >
                  {selectedAgent.outputSim >= 0 ? `+` : ``}$
                  {selectedAgent.outputSim.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>UTILIZATION</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">{selectedAgent.utilization}%</span>
                  <div className="w-14 h-1.5 bg-slate-800 rounded overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded"
                      style={{ width: `${selectedAgent.utilization}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>ALIGNMENT</span>
                <span className="text-emerald-400 font-semibold">
                  {selectedAgent.alignment.toFixed(2)} · ALIGNED
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>FIELD NODES</span>
                <span className="text-slate-300">{selectedAgent.fieldNodes}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>EVENTS · SESSION</span>
                <span className="text-cyan-400 font-semibold">{selectedAgent.eventRate} / s</span>
              </div>

              {/* Agent Quick Weight Adjustment */}
              {onUpdateAgentAllocation && (
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">AGENT ALLOCATION</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onUpdateAgentAllocation(selectedAgent.id, -5)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                    >
                      -5%
                    </button>
                    <span className="text-white font-bold">{selectedAgent.confidence}%</span>
                    <button
                      onClick={() => onUpdateAgentAllocation(selectedAgent.id, 5)}
                      className="px-2 py-0.5 rounded bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200"
                    >
                      +5%
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {inspectorTab === 'LINKS' && (
            <div className="space-y-1.5 text-[10px]">
              <div className="text-slate-400">SYNAPSE CONNECTION MATRIX:</div>
              <div className="p-1.5 bg-slate-900/70 rounded border border-slate-800 space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span>ORIN [Predictive]</span>
                  <span className="text-cyan-400">0.94 Correlation (Active)</span>
                </div>
                <div className="flex justify-between">
                  <span>LUMA [Execution]</span>
                  <span className="text-cyan-400">0.88 Depth Lock</span>
                </div>
                <div className="flex justify-between">
                  <span>VESK [Risk Armor]</span>
                  <span className="text-purple-400">0.82 Negative Var Gate</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-sans italic">
                {selectedAgent.strategyFocus}
              </p>
            </div>
          )}

          {inspectorTab === 'LOG' && (
            <div className="space-y-1 max-h-28 overflow-y-auto pr-1 text-[10px] text-slate-300 font-mono">
              <div className="text-cyan-400">[12:29:14] Momentum breakout confirmed at 67,410</div>
              <div className="text-slate-400">[12:28:40] Correlation weight synced with ORIN 0.94</div>
              <div className="text-slate-400">[12:27:15] Synthetic order density peak in NX-0104</div>
              <div className="text-emerald-400">[12:26:01] Trailing target updated +1.4%</div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM TELEMETRY STATUS BAR (Directly from screenshot) */}
      <div className="absolute bottom-2 left-4 right-4 z-10 flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-400 pointer-events-none">
        <div className="flex items-center gap-3">
          <span>YAW <strong className="text-slate-200">{yaw.toFixed(2)}</strong></span>
          <span>PITCH <strong className="text-slate-200">{pitch.toFixed(2)}</strong></span>
          <span>ZOOM <strong className="text-slate-200">{zoom.toFixed(2)}x</strong></span>
        </div>
        <div className="text-slate-400 hidden sm:block">
          DRAG ROTATE · SCROLL ZOOM · CLICK AGENT TO FOCUS
        </div>
      </div>
    </div>
  );
};
