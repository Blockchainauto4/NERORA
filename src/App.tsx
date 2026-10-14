/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  INITIAL_AGENTS,
  INITIAL_METRICS,
  INITIAL_ASSETS,
  INITIAL_POSITIONS,
  INITIAL_ORDERS,
  INITIAL_EQUITY_SERIES,
  INITIAL_CORTEX_TRACE,
} from './data/initialData';
import { Agent, SystemMetrics, MarketAsset, Position, TradeOrder, EquityPoint, CortexTracePoint } from './types/trading';
import { HeaderBar } from './components/HeaderBar';
import { AgentLedger } from './components/AgentLedger';
import { SynapticVortex } from './components/SynapticVortex';
import { OutputChart } from './components/OutputChart';
import { CortexTrace } from './components/CortexTrace';
import { TradeDeskModal } from './components/TradeDeskModal';
import { StrategyConfigModal } from './components/StrategyConfigModal';
import { TextureControlsModal, TextureSettings } from './components/TextureControlsModal';
import { soundFx } from './services/soundFx';
import { apiClient } from './services/apiClient';
import cosmicBackdropImage from './assets/images/cosmic_synaptic_texture_1791942684366.jpg';

export default function App() {
  // Primary system state
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [selectedAgent, setSelectedAgent] = useState<Agent>(INITIAL_AGENTS[0]);
  const [metrics, setMetrics] = useState<SystemMetrics>(INITIAL_METRICS);
  const [assets, setAssets] = useState<MarketAsset[]>(INITIAL_ASSETS);
  const [activeAsset, setActiveAsset] = useState<MarketAsset>(INITIAL_ASSETS[0]);
  const [positions, setPositions] = useState<Position[]>(INITIAL_POSITIONS);
  const [orders, setOrders] = useState<TradeOrder[]>(INITIAL_ORDERS);
  const [equitySeries, setEquitySeries] = useState<EquityPoint[]>(INITIAL_EQUITY_SERIES);
  const [cortexTrace, setCortexTrace] = useState<CortexTracePoint[]>(INITIAL_CORTEX_TRACE);

  // Platform simulation controls
  const [isAutoTrading, setIsAutoTrading] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [consensusThreshold, setConsensusThreshold] = useState<number>(5);
  const [maxDrawdownLimit, setMaxDrawdownLimit] = useState<number>(5);

  // Texture and Atmosphere Settings
  const [textureSettings, setTextureSettings] = useState<TextureSettings>({
    enableCosmicBackdrop: true,
    cosmicOpacity: 0.28,
    enableFilmGrain: true,
    enableScanlines: false,
    enableBrushedMetal: true,
    glowIntensity: 'vivid',
  });

  // Modals state
  const [isTradeDeskOpen, setIsTradeDeskOpen] = useState<boolean>(false);
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState<boolean>(false);
  const [isTextureModalOpen, setIsTextureModalOpen] = useState<boolean>(false);

  // Sync with Vercel serverless /api/market on mount
  useEffect(() => {
    apiClient.getMarketData().then((res) => {
      if (res && res.success && res.market && res.market.length > 0) {
        setAssets((prev) =>
          prev.map((ast) => {
            const found = res.market.find((m) => m.symbol === ast.symbol);
            if (found) {
              return {
                ...ast,
                price: found.price,
                change24h: found.change24h,
                high24h: found.high24h,
                low24h: found.low24h,
                volume24h: found.volume24h,
              };
            }
            return ast;
          })
        );
      }
    }).catch(() => {});
  }, []);

  // Real-time ticking engine
  useEffect(() => {
    soundFx.isMuted = isMuted;
  }, [isMuted]);

  // Market price fluctuation & agent utilization telemetry loop
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Slightly drift market prices
      setAssets((prevAssets) =>
        prevAssets.map((asset) => {
          const delta = (Math.random() - 0.49) * (asset.price * 0.0008);
          const newPrice = Math.max(1, asset.price + delta);
          return {
            ...asset,
            price: newPrice,
          };
        })
      );

      // 2. Modulate physics metrics slightly for live vitality
      setMetrics((prev) => {
        const velDelta = (Math.random() - 0.5) * 0.04;
        const stretchDelta = (Math.random() - 0.5) * 0.01;
        const rateDelta = Math.floor((Math.random() - 0.5) * 40);
        const coherenceDelta = (Math.random() - 0.5) * 0.2;

        return {
          ...prev,
          angularVelocity: Math.max(2.1, Math.min(3.5, prev.angularVelocity + velDelta)),
          axialStretch: Math.max(0.65, Math.min(0.9, prev.axialStretch + stretchDelta)),
          eventRate: Math.max(1100, Math.min(1450, prev.eventRate + rateDelta)),
          coherence: Math.max(94.0, Math.min(99.5, prev.coherence + coherenceDelta)),
          latencyMs: Math.random() > 0.8 ? 7 : 6,
        };
      });

      // 3. Update active position mark prices & unrealized PnL
      setPositions((prevPositions) =>
        prevPositions.map((pos) => {
          const currentAsset = assets.find((a) => a.symbol === pos.symbol);
          if (!currentAsset) return pos;

          const priceDiff = currentAsset.price - pos.entryPrice;
          const mult = pos.side === 'LONG' ? 1 : -1;
          const uPnl = priceDiff * pos.size * pos.leverage * mult;
          const uPnlPct = (priceDiff / pos.entryPrice) * 100 * pos.leverage * mult;

          return {
            ...pos,
            currentPrice: currentAsset.price,
            unrealizedPnl: uPnl,
            unrealizedPnlPercent: uPnlPct,
          };
        })
      );
    }, 1200 / simSpeed);

    return () => clearInterval(interval);
  }, [simSpeed, assets]);

  // Autonomous Trading Agent Order Dispatch Loop
  useEffect(() => {
    if (!isAutoTrading) return;

    // Trigger an autonomous synthetic trade decision every ~6-12 seconds divided by speed
    const tradeInterval = setInterval(() => {
      // Pick random active asset & agent convergence
      const targetAsset = assets[Math.floor(Math.random() * assets.length)];
      const randomSide = Math.random() > 0.42 ? 'BUY' : 'SELL';
      const consensusNum = Math.floor(Math.random() * 2) + 5; // 5 or 6

      // Play subtle consensus sound
      soundFx.playConsensus();

      // Formulate rationale
      const agentTriggers = [
        {
          agent: 'NOVA',
          text: `Detected synthetic volatility expansion in ${targetAsset.symbol} cluster`,
        },
        {
          agent: 'ORIN',
          text: `Predictive model converged on 93.8% upside trajectory for ${targetAsset.symbol}`,
        },
        {
          agent: 'DASH',
          text: `Rapid micro-spread imbalance detected across synthetic liquidity lanes`,
        },
        {
          agent: 'LUMA',
          text: `Optimal routing split executed with zero slippage`,
        },
      ];

      const trigger = agentTriggers[Math.floor(Math.random() * agentTriggers.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      // Simulated trade size & price
      const tradeSize = parseFloat((Math.random() * 0.8 + 0.1).toFixed(2));
      const orderPrice = targetAsset.price;

      // Realize slight gain into balance
      const profitDelta = (Math.random() * 45 + 10) * (Math.random() > 0.15 ? 1 : -0.5);

      // Play execution audio
      soundFx.playOrderExecuted(profitDelta > 0);

      const newOrder: TradeOrder = {
        id: `ord-${Date.now().toString().slice(-4)}`,
        timestamp: timeStr,
        symbol: targetAsset.symbol,
        side: randomSide,
        price: orderPrice,
        size: tradeSize,
        fee: parseFloat((Math.random() * 3 + 1).toFixed(2)),
        status: 'FILLED',
        consensusScore: `${consensusNum} / 6`,
        rationale: trigger.text,
        primaryAgent: trigger.agent,
      };

      setOrders((prev) => [newOrder, ...prev.slice(0, 39)]);

      // Update system metrics
      setMetrics((prev) => {
        const newBalance = prev.balance + profitDelta;
        const newCombined = prev.combinedOutput + profitDelta;
        const newReturn = ((newBalance - prev.baseBalance) / prev.baseBalance) * 100;
        return {
          ...prev,
          balance: newBalance,
          combinedOutput: newCombined,
          returnPercent: newReturn,
          roundNumber: prev.roundNumber + 1,
          totalDecisions: prev.totalDecisions + 1,
        };
      });

      // Update Equity curve points
      setEquitySeries((prev) => {
        const last = prev[prev.length - 1];
        const newEquity = (last ? last.equity : 60693.84) + profitDelta;
        const newPoint: EquityPoint = {
          timestamp: Date.now(),
          timeStr,
          equity: newEquity,
          netChange: newEquity - 50000,
        };
        return [...prev.slice(-14), newPoint];
      });

      // Update Cortex Trace line & add marker
      setCortexTrace((prev) => {
        const val = Math.floor(Math.random() * 45) + 45;
        const newTrace: CortexTracePoint = {
          id: `ct-${Date.now()}`,
          timeStr,
          timestamp: prev.length + 1,
          value: val,
          baseline: 50,
          marker: {
            type: randomSide === 'BUY' ? 'BUY' : 'DEFENSE',
            agent: trigger.agent,
            label: randomSide === 'BUY' ? 'CONVERGE_BUY' : 'RISK_SHIELD',
            details: trigger.text,
          },
        };
        return [...prev.slice(-17), newTrace];
      });

      // Boost agent output
      setAgents((prevAgents) =>
        prevAgents.map((ag) => {
          if (ag.name === trigger.agent) {
            return {
              ...ag,
              outputSim: ag.outputSim + Math.round(profitDelta),
              eventRate: Math.min(130, ag.eventRate + 2),
            };
          }
          return ag;
        })
      );
    }, (7000 + Math.random() * 4000) / simSpeed);

    return () => clearInterval(tradeInterval);
  }, [isAutoTrading, simSpeed, assets]);

  // Handle closing a position
  const handleClosePosition = (positionId: string) => {
    const pos = positions.find((p) => p.id === positionId);
    if (!pos) return;

    soundFx.playOrderExecuted(pos.unrealizedPnl >= 0);

    // Apply realized pnl to system metrics
    setMetrics((prev) => {
      const newBal = prev.balance + pos.unrealizedPnl;
      const newOut = prev.combinedOutput + pos.unrealizedPnl;
      return {
        ...prev,
        balance: newBal,
        combinedOutput: newOut,
        returnPercent: ((newBal - prev.baseBalance) / prev.baseBalance) * 100,
      };
    });

    // Remove from open positions
    setPositions((prev) => prev.filter((p) => p.id !== positionId));

    // Record close order
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const closeOrder: TradeOrder = {
      id: `ord-${Date.now().toString().slice(-4)}`,
      timestamp: timeStr,
      symbol: pos.symbol,
      side: pos.side === 'LONG' ? 'SELL' : 'BUY',
      price: pos.currentPrice,
      size: pos.size,
      pnl: pos.unrealizedPnl,
      fee: 2.5,
      status: 'FILLED',
      consensusScore: '6 / 6',
      rationale: `Manual position closure realized $${pos.unrealizedPnl.toFixed(2)}`,
      primaryAgent: 'OPERATOR',
    };
    setOrders((prev) => [closeOrder, ...prev]);
  };

  // Handle manual discretionary order submission
  const handleExecuteManualTrade = (trade: {
    symbol: string;
    side: 'BUY' | 'SELL';
    size: number;
    price: number;
    leverage: number;
  }) => {
    soundFx.playOrderExecuted(true);

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const newPos: Position = {
      id: `pos-${Date.now().toString().slice(-4)}`,
      symbol: trade.symbol,
      side: trade.side === 'BUY' ? 'LONG' : 'SHORT',
      entryPrice: trade.price,
      currentPrice: trade.price,
      size: trade.size,
      leverage: trade.leverage,
      unrealizedPnl: 0,
      unrealizedPnlPercent: 0,
      openedAt: timeStr,
      agentOrigin: 'MANUAL OVERRIDE (VESK VERIFIED)',
    };

    setPositions((prev) => [newPos, ...prev]);

    const ord: TradeOrder = {
      id: `ord-${Date.now().toString().slice(-4)}`,
      timestamp: timeStr,
      symbol: trade.symbol,
      side: trade.side,
      price: trade.price,
      size: trade.size,
      fee: 3.2,
      status: 'FILLED',
      consensusScore: 'MANUAL',
      rationale: 'Discretionary trader order passed through synaptic risk filter',
      primaryAgent: 'OPERATOR',
    };

    setOrders((prev) => [ord, ...prev]);

    // Async notify Vercel serverless ledger
    apiClient.dispatchOrder({
      symbol: trade.symbol,
      side: trade.side,
      size: trade.size,
      price: trade.price,
      leverage: trade.leverage,
      rationale: 'Discretionary trader order passed through synaptic risk filter',
    }).catch(() => {});
  };

  // Reset simulation
  const handleResetSimulation = () => {
    setMetrics(INITIAL_METRICS);
    setPositions(INITIAL_POSITIONS);
    setOrders(INITIAL_ORDERS);
    setAgents(INITIAL_AGENTS);
    setEquitySeries(INITIAL_EQUITY_SERIES);
    setCortexTrace(INITIAL_CORTEX_TRACE);
  };

  // Toggle agent active
  const handleToggleAgentActive = (agentId: string) => {
    setAgents((prev) =>
      prev.map((ag) => (ag.id === agentId ? { ...ag, active: !ag.active } : ag))
    );
  };

  // Update agent confidence / allocation
  const handleUpdateAgentAllocation = (agentId: string, delta: number) => {
    setAgents((prev) =>
      prev.map((ag) =>
        ag.id === agentId
          ? {
              ...ag,
              confidence: Math.max(10, Math.min(100, ag.confidence + delta)),
              utilization: Math.max(20, Math.min(100, ag.utilization + delta)),
            }
          : ag
      )
    );
  };

  const handleUpdateTextureSettings = (newSettings: Partial<TextureSettings>) => {
    setTextureSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <div
      className={`relative min-h-screen bg-[#03060f] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden ${
        textureSettings.enableBrushedMetal ? 'texture-brushed' : ''
      }`}
    >
      {/* 1. COSMIC SYNAPTIC BACKDROP LAYER (Inspired by uploaded cosmic longevity civilization) */}
      {textureSettings.enableCosmicBackdrop && (
        <div
          className="fixed inset-0 pointer-events-none z-0 cosmic-backdrop transition-opacity duration-700"
          style={{
            backgroundImage: `url(${cosmicBackdropImage})`,
            opacity: textureSettings.cosmicOpacity,
          }}
        />
      )}

      {/* Dark gradient vignette over the cosmic backdrop to ensure 100% legibility */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-[#03060f]/85 via-[#03060f]/75 to-[#02040a]/95" />

      {/* 2. TACTILE SVG FILM GRAIN NOISE FILTER */}
      {textureSettings.enableFilmGrain && (
        <svg
          className="fixed inset-0 w-full h-full pointer-events-none z-40 opacity-[0.045] mix-blend-screen"
          xmlns="http://www.w3.org/2000/svg"
        >
          <filter id="tactileNoise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.75"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#tactileNoise)" />
        </svg>
      )}

      {/* 3. OPTIONAL HOLOGRAM SCANLINE RASTER */}
      {textureSettings.enableScanlines && (
        <div className="fixed inset-0 pointer-events-none z-40 texture-scanlines opacity-40" />
      )}

      {/* 4. Terminal Main Interface */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header Bar with Brand Wordmark, KPIs, and Telemetry Ribbon */}
        <HeaderBar
          metrics={metrics}
          isAutoTrading={isAutoTrading}
          onToggleAutoTrading={() => setIsAutoTrading((prev) => !prev)}
          simSpeed={simSpeed}
          onChangeSimSpeed={setSimSpeed}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted((prev) => !prev)}
          activeAsset={activeAsset}
          assets={assets}
          onSelectAsset={setActiveAsset}
          onOpenPositionsModal={() => setIsTradeDeskOpen(true)}
          onOpenStrategyModal={() => setIsStrategyModalOpen(true)}
          onOpenManualTradeModal={() => setIsTradeDeskOpen(true)}
          onOpenTextureModal={() => setIsTextureModalOpen(true)}
        />

        {/* Main Terminal Body */}
        <main className="flex-1 max-w-[1720px] w-full mx-auto px-3 sm:px-4 py-3.5 space-y-3.5">
          {/* THE SIX / AGENT LEDGER (Top horizontal row from screenshot) */}
          <section aria-label="Agent Ledger">
            <AgentLedger
              agents={agents}
              selectedAgent={selectedAgent}
              onSelectAgent={setSelectedAgent}
            />
          </section>

          {/* 01 / THE VORTEX - 3D SYNAPTIC CANVAS (Centerpiece from screenshot) */}
          <section aria-label="Synaptic Vortex Visualization">
            <SynapticVortex
              agents={agents}
              selectedAgent={selectedAgent}
              onSelectAgent={setSelectedAgent}
              metrics={metrics}
              onUpdateAgentAllocation={handleUpdateAgentAllocation}
            />
          </section>

          {/* BOTTOM TWIN ANALYTICAL PANELS (From screenshot) */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
            {/* Panel 03: COMBINED OUTPUT - SYSTEM-WIDE */}
            <OutputChart
              equitySeries={equitySeries}
              combinedOutput={metrics.combinedOutput}
              baseBalance={metrics.baseBalance}
              activeAgentsCount={agents.filter((a) => a.active).length}
            />

            {/* Panel 04: CORTEX TRACE - THE POINTS WHERE THE MODEL MOVED */}
            <CortexTrace
              tracePoints={cortexTrace}
              agents={agents}
              selectedAgent={selectedAgent}
              onSelectAgent={setSelectedAgent}
              roundNumber={metrics.roundNumber}
            />
          </section>
        </main>
      </div>

      {/* 5. Modals */}
      <TradeDeskModal
        isOpen={isTradeDeskOpen}
        onClose={() => setIsTradeDeskOpen(false)}
        positions={positions}
        orders={orders}
        assets={assets}
        activeAsset={activeAsset}
        agents={agents}
        onClosePosition={handleClosePosition}
        onExecuteManualTrade={handleExecuteManualTrade}
      />

      <StrategyConfigModal
        isOpen={isStrategyModalOpen}
        onClose={() => setIsStrategyModalOpen(false)}
        agents={agents}
        metrics={metrics}
        consensusThreshold={consensusThreshold}
        onChangeConsensusThreshold={setConsensusThreshold}
        maxDrawdownLimit={maxDrawdownLimit}
        onChangeMaxDrawdownLimit={setMaxDrawdownLimit}
        onResetSimulation={handleResetSimulation}
        onToggleAgentActive={handleToggleAgentActive}
      />

      <TextureControlsModal
        isOpen={isTextureModalOpen}
        onClose={() => setIsTextureModalOpen(false)}
        settings={textureSettings}
        onUpdateSettings={handleUpdateTextureSettings}
        cosmicImagePath={cosmicBackdropImage}
      />
    </div>
  );
}
