'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { sound } from './SoundFX';

export type FiberViewMode = 'card' | 'network' | 'tamper' | 'crypto';

interface TelemetryHUDProps {
  mode: FiberViewMode;
  onModeChange: (m: FiberViewMode) => void;
  // Card Controls
  isFlipped: boolean;
  onFlipToggle: () => void;
  isScanning: boolean;
  onScanToggle: () => void;
  exploded: boolean;
  onExplodeToggle: () => void;
  wireframe: boolean;
  onWireframeToggle: () => void;
  onResetCamera: () => void;
  // Tamper Controls
  isTampered: boolean;
  onTamperToggle: () => void;
  // Active Node
  selectedNodeId: string | null;
}

export default function TelemetryHUD({
  mode,
  onModeChange,
  isFlipped,
  onFlipToggle,
  isScanning,
  onScanToggle,
  exploded,
  onExplodeToggle,
  wireframe,
  onWireframeToggle,
  onResetCamera,
  isTampered,
  onTamperToggle,
  selectedNodeId,
}: TelemetryHUDProps) {
  const [fps, setFps] = useState(60);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showHelp, setShowHelp] = useState(true);

  // Measure rough client FPS
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const loop = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleAudioToggle = () => {
    const next = !audioEnabled;
    sound.enabled = next;
    setAudioEnabled(next);
    if (next) sound.playClick();
  };

  const handleModeClick = (newMode: FiberViewMode) => {
    sound.playClick();
    onModeChange(newMode);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-6 text-slate-200 select-none overflow-hidden">
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. TOP STATUS BAR & BRANDING
          ───────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 bg-slate-900/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shadow-xl">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-cyan-600/30 border border-cyan-500/50 flex items-center justify-center text-cyan-300 font-bold text-sm shadow-inner group-hover:scale-105 transition">
              3D
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base tracking-tight font-sans">
                  medi<span className="text-cyan-400">qr</span>
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                  R3F Fiber v8
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400">Roadside Emergency 3D Architecture</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono pl-3 border-l border-white/10 text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Consortium: Online
            </span>
            <span className="text-white/20">|</span>
            <span>PII On-Chain: <strong className="text-white">0%</strong></span>
            <span className="text-white/20">|</span>
            <span>Latency: <strong className="text-cyan-300">&lt; 0.02s</strong></span>
          </div>
        </div>

        {/* Telemetry Readout & Audio Switcher */}
        <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/10 shadow-xl font-mono text-xs">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/40 text-[11px]">
            <span className="text-slate-400">FPS:</span>
            <span className={fps >= 50 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {fps}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAudioToggle}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition border flex items-center gap-1 cursor-pointer ${
              audioEnabled
                ? 'bg-cyan-950 text-cyan-300 border-cyan-600'
                : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
            title="Toggle synthesized Web Audio feedback"
          >
            <span>{audioEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF'}</span>
          </button>

          <Link
            href="/"
            className="px-3 py-1 rounded text-[11px] font-semibold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition"
          >
            ← Exit to Main Site
          </Link>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. FLOATING CENTER-RIGHT CONTROL DOCK
          ───────────────────────────────────────────────────────────────────────────── */}
      <div className="self-end my-auto pointer-events-auto flex flex-col gap-3 max-w-sm w-full sm:w-80">
        {/* Mode Switcher Tabs */}
        <div className="bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-2xl flex flex-col gap-1.5">
          <div className="text-[10px] font-mono text-slate-400 px-2 pt-1 font-semibold uppercase tracking-wider flex justify-between">
            <span>3D Interactive Scene</span>
            <span className="text-cyan-400 font-bold">MODE 0{mode === 'card' ? '1' : mode === 'network' ? '2' : mode === 'tamper' ? '3' : '4'}</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => handleModeClick('card')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition flex items-center gap-2 cursor-pointer border ${
                mode === 'card'
                  ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30'
                  : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10'
              }`}
            >
              <span>🎴</span>
              <span>Smart Card 3D</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeClick('network')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition flex items-center gap-2 cursor-pointer border ${
                mode === 'network'
                  ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30'
                  : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10'
              }`}
            >
              <span>🌐</span>
              <span>Consortium Mesh</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeClick('tamper')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition flex items-center gap-2 cursor-pointer border ${
                mode === 'tamper'
                  ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-600/30'
                  : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10'
              }`}
            >
              <span>⚡</span>
              <span>Tamper Lab</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeClick('crypto')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition flex items-center gap-2 cursor-pointer border ${
                mode === 'crypto'
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                  : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10'
              }`}
            >
              <span>📜</span>
              <span>Crypto Specs</span>
            </button>
          </div>
        </div>

        {/* Context-Specific Actions */}
        {mode === 'card' && (
          <div className="bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-2xl flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-mono text-cyan-300 font-bold">
              <span>CARD INSPECTION ACTIONS</span>
              <span className="text-[10px] text-slate-400">Click card to flip</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => { sound.playFlip(); onFlipToggle(); }}
                className="px-3 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-200 font-semibold transition cursor-pointer text-left"
              >
                🔄 {isFlipped ? 'Show Front Triage' : 'Show Back Vault'}
              </button>

              <button
                type="button"
                onClick={() => { sound.playScan(); onScanToggle(); }}
                className={`px-3 py-2 rounded-xl border font-semibold transition cursor-pointer text-left ${
                  isScanning
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-xs'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                🟢 {isScanning ? 'Laser: ACTIVE' : 'Start Laser Scan'}
              </button>

              <button
                type="button"
                onClick={() => { sound.playClick(); onExplodeToggle(); }}
                className={`px-3 py-2 rounded-xl border font-semibold transition cursor-pointer text-left ${
                  exploded
                    ? 'bg-amber-950 text-amber-300 border-amber-500 shadow-xs'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                💥 {exploded ? 'Collapse Layers' : 'Explode 4 Layers'}
              </button>

              <button
                type="button"
                onClick={() => { sound.playClick(); onWireframeToggle(); }}
                className={`px-3 py-2 rounded-xl border font-semibold transition cursor-pointer text-left ${
                  wireframe
                    ? 'bg-purple-950 text-purple-300 border-purple-500'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                🕸️ {wireframe ? 'Solid Surface' : 'X-Ray Wireframe'}
              </button>
            </div>

            <button
              type="button"
              onClick={onResetCamera}
              className="text-[11px] font-mono text-slate-400 hover:text-white py-1 text-center transition"
            >
              Reset Camera Perspective ↺
            </button>
          </div>
        )}

        {mode === 'network' && (
          <div className="bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-2xl flex flex-col gap-2 text-xs">
            <div className="text-cyan-300 font-mono font-bold text-xs">DISTRIBUTED TOPOLOGY</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Click any node in the 3D space to focus on its cryptographic responsibilities and ports.
            </p>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] space-y-1">
              <div>🏥 <span className="text-slate-400">Node A:</span> <span className="text-white">Apollo (:5001)</span></div>
              <div>🏥 <span className="text-slate-400">Node B:</span> <span className="text-white">Fortis (:5002)</span></div>
              <div>📡 <span className="text-slate-400">Hardware Mesh:</span> <span className="text-cyan-300">ESP32 192.168.4.1</span></div>
              <div>⛓️ <span className="text-slate-400">Consensus:</span> <span className="text-amber-300">Ethereum EVM</span></div>
            </div>
          </div>
        )}

        {mode === 'tamper' && (
          <div className="bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-2xl flex flex-col gap-2.5">
            <div className="text-xs font-mono font-bold text-rose-300">LIVE BIT-FLIP EXPERIMENT</div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Inject a simulated 1-bit unauthorized corruption into the hospital off-chain database and watch the Ethereum consensus engine instantly block it.
            </p>

            <button
              type="button"
              onClick={() => {
                if (!isTampered) sound.playTamperAlarm();
                else sound.playSuccess();
                onTamperToggle();
              }}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-lg ${
                isTampered
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 animate-pulse'
              }`}
            >
              {isTampered ? '✓ Restore System Integrity' : '⚠️ Trigger Bit-Flip Tamper Attack'}
            </button>

            <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 font-mono text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Integrity:</span>
                <span className={isTampered ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {isTampered ? 'CRITICAL CLASH' : '100% VERIFIED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Collision Probability:</span>
                <span className="text-slate-200">2⁻²⁵⁶ (Impossible)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Detection Latency:</span>
                <span className="text-cyan-300 font-bold">&lt; 1 millisecond</span>
              </div>
            </div>
          </div>
        )}

        {mode === 'crypto' && (
          <div className="bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-2xl flex flex-col gap-2 text-xs">
            <div className="text-xs font-mono font-bold text-indigo-300">CRYPTOGRAPHIC PROTOCOL</div>
            <div className="space-y-2 font-mono text-[11px]">
              <div className="p-2 rounded-lg bg-black/40 border border-indigo-500/30">
                <div className="text-indigo-300 font-bold">1. HMAC-SHA256 Token</div>
                <div className="text-slate-400 text-[10px]">Protects identity against rainbow table &amp; enumeration attacks.</div>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-cyan-500/30">
                <div className="text-cyan-300 font-bold">2. AES-256-GCM Shards</div>
                <div className="text-slate-400 text-[10px]">Encrypted at rest across partitioned hospital nodes with 16-byte auth tags.</div>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-amber-500/30">
                <div className="text-amber-300 font-bold">3. Zero-PII EVM Anchor</div>
                <div className="text-slate-400 text-[10px]">Only 32-byte checksums anchored on Solidity contract. HIPAA &amp; DPDP compliant.</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          3. BOTTOM QUICK ACTION DOCK (PORTAL SHORTCUTS)
          ───────────────────────────────────────────────────────────────────────────── */}
      <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 hidden lg:flex">
          <span>🎮 <strong className="text-white">Mouse Controls:</strong> Left-drag to rotate · Scroll to zoom · Right-drag to pan · Click card to flip</span>
        </div>

        {/* Direct links to all functional portals in the repository */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/doctor"
            className="px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 text-blue-200 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <span>🩺</span>
            <span>Doctor Portal</span>
          </Link>

          <Link
            href="/emergency"
            className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-200 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <span>🚑</span>
            <span>Roadside Scanner</span>
          </Link>

          <Link
            href="/hospital"
            className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-200 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <span>🏥</span>
            <span>Hospital Hub</span>
          </Link>

          <Link
            href="/book"
            className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition shadow-md shadow-cyan-600/25 flex items-center gap-1.5"
          >
            <span>💳</span>
            <span>Provision Card (₹500)</span>
          </Link>

          <Link
            href="/blockchain"
            className="px-3 py-1.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 text-amber-200 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <span>⛓️</span>
            <span>Ledger Blocks</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
