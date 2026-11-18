'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import FiberCanvas from '../../components/fiber/FiberCanvas';

export default function ThreeFiberPage() {
  const [showDossier, setShowDossier] = useState(false);

  return (
    <div className="relative w-full min-h-screen bg-[#030712] text-slate-100 overflow-x-hidden">
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. FULL-VIEWPORT 3D REACT THREE FIBER ENGINE
          ───────────────────────────────────────────────────────────────────────────── */}
      <section className="relative w-full h-screen">
        <FiberCanvas />

        {/* Floating Toggle to Scroll down or open Technical Blueprint */}
        <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('technical-dossier');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              setShowDossier(true);
            }}
            className="group px-4 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-xs font-mono font-medium text-cyan-300 hover:text-white border border-cyan-500/40 hover:border-cyan-400 shadow-xl backdrop-blur-md transition flex items-center gap-2 cursor-pointer"
          >
            <span>Read Engineering Blueprint &amp; Specs</span>
            <span className="group-hover:translate-y-0.5 transition-transform">↓</span>
          </button>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. DETAILED ARCHITECTURAL DOSSIER & REPOSITORY SPECIFICATIONS
          ───────────────────────────────────────────────────────────────────────────── */}
      <section id="technical-dossier" className="w-full bg-[#050914] border-t border-white/10 py-20 px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="max-w-6xl mx-auto space-y-16">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Sovereign Cryptographic Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-sans">
              Dual-Segment Smart Cards Meet <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400">
                Hardware-Accelerated 3D Fiber
              </span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Purvaja MediQR replaces centralized, vulnerable medical databases with an air-gapped physical smart card,
              content-addressable hospital storage nodes, and an immutable Ethereum blockchain anchor.
            </p>
          </div>

          {/* 3 Core Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 hover:border-cyan-500/40 transition group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
                🎴
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-sans">Dual-Segment Optical Matrix</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans mb-4">
                The front segment is readable by any phone camera in <strong>&lt; 0.02s</strong> offline, exposing only non-sensitive triage vitals (Blood Type O-, Penicillin allergy, ICE phone). The back contains a salted HMAC-SHA256 query token.
              </p>
              <div className="font-mono text-[11px] text-cyan-400 bg-cyan-950/40 p-2.5 rounded-xl border border-cyan-800/40">
                LATENCY: &lt; 0.02s · CELLULAR: 0%
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 hover:border-emerald-500/40 transition group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
                ⛓️
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-sans">Zero-PII Blockchain Anchor</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans mb-4">
                No patient names, illnesses, or records ever touch the Ethereum ledger. Our Solidity contract (<code>MedicalRecordLedger.sol</code>) anchors solely 32-byte SHA-256 cryptographic hashes, guaranteeing 100% HIPAA and DPDP compliance.
              </p>
              <div className="font-mono text-[11px] text-emerald-400 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/40">
                ON-CHAIN PII: 0% · EVM GAS: 48,201
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 hover:border-rose-500/40 transition group">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
                🛡️
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-sans">Live Bit-Flip Rejection</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans mb-4">
                If an unauthorized actor tampers with a single bit in an off-chain hospital archive, the recalculated SHA-256 hash mathematically clashes with the blockchain seal (2⁻²⁵⁶ collision probability). Decryption is instantly aborted in memory.
              </p>
              <div className="font-mono text-[11px] text-rose-400 bg-rose-950/40 p-2.5 rounded-xl border border-rose-800/40">
                AUDIT ALARM: &lt; 1ms · ZERO LEAK
              </div>
            </div>
          </div>

          {/* Interactive Flow Diagram */}
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-white/10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white font-sans">End-to-End Cryptographic Pipeline</h3>
                <p className="text-xs text-slate-400 font-sans">How MediQR bridges the physical smart card with distributed hospital nodes and Ethereum.</p>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Consensus Active
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                <div className="text-cyan-400 font-bold">1. Roadside Trauma</div>
                <div className="text-slate-300">Unconscious patient found with no ID. Paramedic scans front QR glyph in &lt;0.02s without internet or cloud login.</div>
                <div className="text-[10px] text-slate-500">Output: Blood O-, Penicillin Allergy</div>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                <div className="text-indigo-400 font-bold">2. Hospital Sharding</div>
                <div className="text-slate-300">Clinical notes &amp; prescriptions encrypted at rest with AES-256-GCM across Hospital A (:5001) &amp; B (:5002).</div>
                <div className="text-[10px] text-slate-500">Output: Content-Addressable Ciphertext</div>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                <div className="text-amber-400 font-bold">3. Ethereum Anchor</div>
                <div className="text-slate-300">SHA-256 fingerprint stored on Solidity ledger. Emits immutable <code>RecordAccessed</code> audit trail event.</div>
                <div className="text-[10px] text-slate-500">Output: 32-Byte Non-Repudiable Seal</div>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                <div className="text-emerald-400 font-bold">4. Doctor Integrity Check</div>
                <div className="text-slate-300">Clinician terminal pulls ciphertext, computes live hash, validates against on-chain block before decrypting in memory.</div>
                <div className="text-[10px] text-slate-500">Output: Tamper-Free Badge Verified</div>
              </div>
            </div>
          </div>

          {/* Functional Portals Launchpad */}
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-white font-sans">Launch Full Functional Microservices</h3>
              <p className="text-xs text-slate-400 font-sans">Experience each module of the MediQR architecture live in your browser.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href="/doctor"
                className="p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-850 border border-white/10 hover:border-blue-500/50 transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">🩺</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                      Workstation
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white group-hover:text-blue-400 transition font-sans">
                    Doctor Verification Portal
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 font-sans">
                    Authenticate as an accredited clinician, inspect patient hash, and run live SHA-256 hash checks.
                  </p>
                </div>
                <span className="text-xs text-blue-400 font-semibold mt-4 flex items-center gap-1">
                  Open Doctor Station →
                </span>
              </Link>

              <Link
                href="/emergency"
                className="p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-850 border border-white/10 hover:border-emerald-500/50 transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">🚑</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Paramedic
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white group-hover:text-emerald-400 transition font-sans">
                    Roadside Emergency Scanner
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 font-sans">
                    First-responder camera viewfinder displaying instant emergency triage with zero internet connection.
                  </p>
                </div>
                <span className="text-xs text-emerald-400 font-semibold mt-4 flex items-center gap-1">
                  Launch Roadside Scanner →
                </span>
              </Link>

              <Link
                href="/hospital"
                className="p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-850 border border-white/10 hover:border-purple-500/50 transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">🏥</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                      Records Hub
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white group-hover:text-purple-400 transition font-sans">
                    Hospital Record Hub
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 font-sans">
                    Upload new diagnostic reports, generate dual-segment MediQR cards, and dispatch off-chain shards.
                  </p>
                </div>
                <span className="text-xs text-purple-400 font-semibold mt-4 flex items-center gap-1">
                  Open Hospital Hub →
                </span>
              </Link>

              <Link
                href="/simulator"
                className="p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-850 border border-white/10 hover:border-rose-500/50 transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">⚡</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                      Testbed
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white group-hover:text-rose-400 transition font-sans">
                    Bit-Flip Tamper Attack Lab
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 font-sans">
                    Corrupt single bits in the off-chain JSON payloads and verify on-chain smart contract clash alarms.
                  </p>
                </div>
                <span className="text-xs text-rose-400 font-semibold mt-4 flex items-center gap-1">
                  Launch Tamper Lab →
                </span>
              </Link>

              <Link
                href="/blockchain"
                className="p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-850 border border-white/10 hover:border-amber-500/50 transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">⛓️</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                      EVM Explorer
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white group-hover:text-amber-400 transition font-sans">
                    Consortium Ledger Explorer
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 font-sans">
                    Inspect mined Ethereum blocks, verify 32-byte cryptographic checksums, and audit access logs.
                  </p>
                </div>
                <span className="text-xs text-amber-400 font-semibold mt-4 flex items-center gap-1">
                  Explore Ledger Blocks →
                </span>
              </Link>

              <Link
                href="/book"
                className="p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-850 border border-white/10 hover:border-cyan-500/50 transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">💳</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                      Provision
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white group-hover:text-cyan-400 transition font-sans">
                    Patient Card Provisioning
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 font-sans">
                    Book OPD consultations, provision physical MediQR smart cards, and receive cryptographic receipts.
                  </p>
                </div>
                <span className="text-xs text-cyan-400 font-semibold mt-4 flex items-center gap-1">
                  Provision MediQR Card →
                </span>
              </Link>
            </div>
          </div>

          {/* GitHub Repository Reference Card */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider">
                Official Open-Source Repository
              </div>
              <div className="text-lg font-bold text-white font-mono">
                github.com/Soham-Bhale/Purvaja-MediQR
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Full documentation, Hardhat smart contract test suites (9/9 passing), cryptographic HMAC engine, and multi-hospital simulator.
              </p>
            </div>

            <a
              href="https://github.com/Soham-Bhale/Purvaja-MediQR"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition shadow-lg shadow-cyan-600/30 flex items-center gap-2"
            >
              <span>View GitHub Repository</span>
              <span>↗</span>
            </a>
          </div>

        </div>
      </section>
    </div>
  );
}
