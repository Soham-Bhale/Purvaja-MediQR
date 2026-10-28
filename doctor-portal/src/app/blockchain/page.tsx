'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getStoredBlocks,
  Block,
  verifyBlockchainIntegrity,
  simulateBlockTamper,
  restoreBlockchain,
} from '../../lib/blockchain-blocks';

export default function BlockchainDashboardPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [integrityStatus, setIntegrityStatus] = useState<{
    isValid: boolean;
    brokenIndex?: number;
    reason?: string;
  }>({ isValid: true });
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [isTampering, setIsTampering] = useState(false);
  const [latestBlockAnim, setLatestBlockAnim] = useState<number | null>(null);

  async function refresh() {
    const loaded = getStoredBlocks();
    setBlocks(loaded);
    const verification = await verifyBlockchainIntegrity(loaded);
    setIntegrityStatus(verification);
  }

  useEffect(() => {
    refresh();

    function onBlockAdded(e: any) {
      refresh();
      if (e.detail && e.detail.length > 0) {
        setLatestBlockAnim(e.detail[e.detail.length - 1].index);
        setTimeout(() => setLatestBlockAnim(null), 3000);
      }
    }

    window.addEventListener('mediqr_blockchain_block_added', onBlockAdded);
    window.addEventListener('storage', refresh);
    const interval = setInterval(refresh, 4000);
    return () => {
      window.removeEventListener('mediqr_blockchain_block_added', onBlockAdded);
      window.removeEventListener('storage', refresh);
      clearInterval(interval);
    };
  }, []);

  async function handleTamperClick() {
    setIsTampering(true);
    try {
      // Tamper with Block #1 if exists, else Block #0
      const targetIdx = blocks.length > 1 ? 1 : 0;
      await simulateBlockTamper(targetIdx, 'Malicious fee altered to ₹0 / Falsified Prescription');
      await refresh();
    } finally {
      setIsTampering(false);
    }
  }

  async function handleRestoreClick() {
    restoreBlockchain();
    await refresh();
  }

  const totalTransactions = blocks.reduce((acc, b) => acc + b.transactions.length, 0);

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-indigo-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Consortium Ledger Monitoring</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Real-Time Blockchain Block Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Visualizing cryptographic hash chaining (<code className="font-mono text-indigo-300">SHA-256</code>) linking paid appointment tokens, hospital node pointers, and tamper-proof clinical records.
          </p>
        </div>

        {/* Cinematic Blockchain Animation Pill */}
        <div className="hidden xl:flex items-center gap-3 bg-black/40 border border-indigo-500/20 rounded-2xl p-2 backdrop-blur-md">
          <div className="w-36 aspect-video rounded-xl overflow-hidden border border-indigo-400/30 shadow-lg relative bg-black">
            <video
              src="/videos/blockchain-seal.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-1 left-1.5 text-[8px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Consortium Active
            </div>
          </div>
        </div>

        {/* Action Controls for Academic Demo */}
        <div className="flex flex-wrap items-center gap-3">
          {integrityStatus.isValid ? (
            <button
              type="button"
              onClick={handleTamperClick}
              disabled={isTampering}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
              title="Simulate a database attack to demonstrate how tampering instantly breaks the blockchain hash chain"
            >
              <span>⚡</span>
              <span>{isTampering ? 'Mutating Block...' : 'Simulate Block Tamper Attack'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRestoreClick}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <span>✓</span>
              <span>Restore Pristine Blockchain</span>
            </button>
          )}

          <Link
            href="/doctor"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition shadow-xs"
          >
            🩺 Doctor Workstation →
          </Link>
        </div>
      </div>

      {/* Network Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Blockchain Height</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 flex items-baseline gap-2">
            <span>#{blocks.length > 0 ? blocks.length - 1 : 0}</span>
            <span className="text-xs font-normal text-slate-500">({blocks.length} Total Blocks)</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mined Transactions</div>
          <div className="text-2xl font-extrabold text-blue-600 mt-1">
            {totalTransactions}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Consensus Engine</div>
          <div className="text-sm font-bold text-slate-900 mt-2 truncate">
            PoA Consortium (Hospital Nodes)
          </div>
        </div>

        <div className={`rounded-xl border p-4 shadow-xs ${
          integrityStatus.isValid
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-rose-50 border-rose-300 text-rose-900 animate-pulse'
        }`}>
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">Chain Integrity Status</div>
          <div className="text-sm font-extrabold mt-1.5 flex items-center gap-1.5">
            <span>{integrityStatus.isValid ? '✓' : '⚠️'}</span>
            <span>{integrityStatus.isValid ? 'SECURED & IMMUTABLE' : 'INTEGRITY VIOLATION DETECTED'}</span>
          </div>
        </div>
      </div>

      {/* Chain Tamper Alert Banner (if broken) */}
      {!integrityStatus.isValid && (
        <div className="bg-rose-600 text-white p-5 rounded-2xl shadow-lg border border-rose-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-top-4">
          <div className="space-y-1">
            <div className="font-extrabold text-sm flex items-center gap-2">
              <span className="text-xl">🚨</span>
              <span>CRYPTOGRAPHIC HASH MISMATCH: Block #{integrityStatus.brokenIndex} Modified!</span>
            </div>
            <p className="text-xs text-rose-100 max-w-3xl leading-relaxed">
              {integrityStatus.reason} Because blockchain blocks are chained via SHA-256, changing even a single character in a historical block invalidates its hash and breaks the cryptographic link for all subsequent blocks.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRestoreClick}
            className="px-4 py-2 bg-white text-rose-700 hover:bg-rose-50 font-extrabold text-xs rounded-xl shadow-xs transition whitespace-nowrap self-start md:self-auto cursor-pointer"
          >
            ✓ Restore Valid Ledger
          </button>
        </div>
      )}

      {/* Visual Block Chain Explorer */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>⛓️</span>
            <span>Cryptographic Block Sequence (Genesis → Latest)</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            Auto-syncs upon appointment payment &amp; consultation completion
          </span>
        </div>

        {/* Blocks Horizontal/Grid Stream */}
        <div className="space-y-6">
          {blocks.map((block, idx) => {
            const isGenesis = block.index === 0;
            const isLatest = idx === blocks.length - 1;
            const isBroken = !integrityStatus.isValid && integrityStatus.brokenIndex !== undefined && idx >= integrityStatus.brokenIndex;
            const isFlash = latestBlockAnim === block.index;

            return (
              <div key={block.index} className="relative">
                {/* Connecting glowing link to previous block */}
                {!isGenesis && (
                  <div className="flex items-center justify-center -my-3 relative z-10">
                    <div className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-xs border ${
                      isBroken
                        ? 'bg-rose-100 text-rose-800 border-rose-300 animate-bounce'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}>
                      <span>{isBroken ? '❌ LINK BROKEN' : '🔗 SHA-256 CRYPTOGRAPHIC LINK'}</span>
                      <span className="opacity-70 text-[9px] hidden sm:inline">
                        (prevHash: {block.previousHash.slice(0, 10)}...)
                      </span>
                    </div>
                  </div>
                )}

                {/* The Block Card */}
                <div className={`rounded-2xl border transition-all duration-300 shadow-sm overflow-hidden ${
                  isFlash
                    ? 'ring-4 ring-indigo-500 scale-[1.01]'
                    : isBroken
                    ? 'border-rose-400 bg-rose-50/60 ring-2 ring-rose-300'
                    : isLatest
                    ? 'border-indigo-300 bg-white shadow-md'
                    : 'border-slate-200 bg-white'
                }`}>
                  {/* Block Header */}
                  <div className={`px-5 py-3.5 border-b flex flex-wrap items-center justify-between gap-3 ${
                    isBroken
                      ? 'bg-rose-100/70 border-rose-200'
                      : isGenesis
                      ? 'bg-slate-900 text-white border-slate-800'
                      : isLatest
                      ? 'bg-indigo-50/80 border-indigo-100'
                      : 'bg-slate-50 border-slate-100'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold ${
                        isGenesis
                          ? 'bg-blue-600 text-white'
                          : isBroken
                          ? 'bg-rose-600 text-white'
                          : 'bg-indigo-600 text-white'
                      }`}>
                        Block #{block.index}
                      </span>
                      <span className={`text-xs font-bold ${isGenesis ? 'text-white' : 'text-slate-900'}`}>
                        {isGenesis ? 'Consortium Genesis Anchor' : `Mined Block • ${block.transactions.length} Transaction(s)`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className={`font-mono text-[11px] ${isGenesis ? 'text-slate-400' : 'text-slate-500'}`}>
                        ⏱️ {new Date(block.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBlock(block);
                          setInspectModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/80 hover:bg-white text-slate-700 border border-slate-200 font-semibold text-[11px] transition shadow-2xs cursor-pointer"
                      >
                        🔍 Inspect Block
                      </button>
                    </div>
                  </div>

                  {/* Block Cryptographic Body */}
                  <div className="p-5 space-y-4">
                    {/* Hashes Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs font-mono">
                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                        <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block mb-0.5">
                          Previous Block Hash (prevHash)
                        </span>
                        <div className="truncate text-slate-700 font-semibold select-all" title={block.previousHash}>
                          {block.previousHash}
                        </div>
                      </div>

                      <div className={`p-3 rounded-xl border ${
                        isBroken
                          ? 'bg-rose-100/50 border-rose-300 text-rose-900 font-bold'
                          : 'bg-indigo-50/50 border-indigo-200 text-indigo-950 font-bold'
                      }`}>
                        <span className="text-[10px] uppercase font-sans font-bold block mb-0.5 opacity-70">
                          Current Block Hash (SHA-256)
                        </span>
                        <div className="truncate select-all" title={block.hash}>
                          {block.hash}
                        </div>
                      </div>
                    </div>

                    {/* Technical details pill: Merkle Root & Nonce */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-md font-mono">
                        Nonce: <strong className="text-slate-800">{block.nonce}</strong>
                      </span>
                      <span className="bg-slate-100 px-2.5 py-1 rounded-md font-mono truncate max-w-md">
                        Merkle Root: <strong className="text-slate-800">{block.merkleRoot.slice(0, 22)}...</strong>
                      </span>
                      <span className="bg-slate-100 px-2.5 py-1 rounded-md">
                        Difficulty: <strong className="text-slate-800">D-{block.difficulty}</strong>
                      </span>
                    </div>

                    {/* Transactions list inside this block */}
                    <div className="border-t border-slate-100 pt-3 space-y-2">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Transactions in this block:
                      </div>

                      <div className="space-y-2">
                        {block.transactions.map((tx, txIdx) => (
                          <div
                            key={tx.txId + txIdx}
                            className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  tx.type === 'APPOINTMENT_PAYMENT_CONFIRMED'
                                    ? 'bg-blue-100 text-blue-800'
                                    : tx.type === 'MEDICAL_RECORD_COMMITTED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {tx.type === 'APPOINTMENT_PAYMENT_CONFIRMED'
                                    ? '🎟️ Appointment Paid'
                                    : tx.type === 'MEDICAL_RECORD_COMMITTED'
                                    ? '🏥 Record Anchored'
                                    : '🛡️ Genesis Setup'}
                                </span>
                                <span className="font-mono text-[11px] text-slate-400 truncate max-w-[140px]">
                                  {tx.txId.slice(0, 16)}...
                                </span>
                              </div>
                              <div className="font-semibold text-slate-900 text-xs">
                                {tx.details}
                              </div>
                              {tx.fileHash && (
                                <div className="font-mono text-[10px] text-slate-500 truncate">
                                  Fingerprint: {tx.fileHash}
                                </div>
                              )}
                            </div>

                            <div className="text-right sm:self-center shrink-0">
                              {tx.amount && (
                                <div className="text-sm font-extrabold text-emerald-700">
                                  {tx.amount}
                                </div>
                              )}
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span>Confirmed</span>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inspect Block Modal */}
      {inspectModalOpen && selectedBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">📦</span>
                <h3 className="font-bold text-base">Block #{selectedBlock.index} Raw Cryptographic Payload</h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="text-xs text-slate-500">
                This raw JSON object represents the cryptographic block data stored across consortium nodes.
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
                {JSON.stringify(selectedBlock, null, 2)}
              </pre>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
