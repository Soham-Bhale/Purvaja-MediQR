'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const InteractiveSmartCard3D = dynamic(
  () => import('../../components/InteractiveSmartCard3D'),
  {
    ssr: false,
    loading: () => (
      <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/15 bg-slate-950 flex items-center justify-center font-mono text-xs text-slate-400">
        Loading 3D WebGL Canvas...
      </div>
    ),
  }
);

export default function Card3DPage() {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Interactive 3D Hardware Model • WebGL</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            MediQR Sovereign Smart Card (3D WebGL Explorer)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Click and drag to rotate the physical card in 360°. Inspect Side A (Roadside Emergency Optical Matrix) and Side B (Cryptographic Physician HMAC Key &amp; FIDO2 Microchip).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold border border-slate-700 transition"
          >
            ← Return to Homepage
          </Link>
          <Link
            href="/book"
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-sans text-xs font-extrabold transition shadow-md shadow-cyan-600/30"
          >
            Book Care (₹500) →
          </Link>
        </div>
      </div>

      {/* 3D Interactive Card Canvas */}
      <div className="bg-slate-950/80 border border-white/15 rounded-3xl p-4 sm:p-6 shadow-2xl">
        <InteractiveSmartCard3D />
      </div>

      {/* Technical Spec Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
          <div className="text-[10px] text-cyan-400 uppercase font-bold">Physical Form Factor</div>
          <div className="text-white font-bold">ISO/IEC 7810 ID-1 Standard</div>
          <div className="text-slate-400 text-[11px]">85.60 × 53.98 × 0.84 mm · Bead-blasted Grade 5 Titanium</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
          <div className="text-[10px] text-rose-400 uppercase font-bold">Emergency Acquisition</div>
          <div className="text-white font-bold">0.018s Roadside Scan</div>
          <div className="text-slate-400 text-[11px]">Any smartphone camera · 100% Offline Viewfinder · No App</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
          <div className="text-[10px] text-indigo-400 uppercase font-bold">Consortium Security</div>
          <div className="text-white font-bold">AES-256-GCM + Ethereum PoA</div>
          <div className="text-slate-400 text-[11px]">32-Byte Salter Key · Hardware Tamper Immunity · Zero PII On-Chain</div>
        </div>
      </div>
    </div>
  );
}
