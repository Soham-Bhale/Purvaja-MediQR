'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SimulatorPage() {
  const [selectedNodePort, setSelectedNodePort] = useState<number>(5001);
  const [selectedRecordId, setSelectedRecordId] = useState<string>('REC-APOLLO-001');
  const [tamperMode, setTamperMode] = useState<'ciphertext' | 'authTag'>('ciphertext');
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentFileHash, setCurrentFileHash] = useState<string | null>(null);
  const [initialTargetHash, setInitialTargetHash] = useState<string | null>(null);

  async function inspectRecord(port: number, recordId: string, isInitial: boolean = false) {
    try {
      const res = await fetch(`http://localhost:${port}/api/records/${recordId}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentFileHash(data.currentFileHash || null);
        if (isInitial || !initialTargetHash) {
          setInitialTargetHash(data.currentFileHash || null);
        }
      }
    } catch {
      setCurrentFileHash(null);
    }
  }

  useEffect(() => {
    inspectRecord(selectedNodePort, selectedRecordId, true);
  }, [selectedNodePort, selectedRecordId]);

  async function handleTamper() {
    setIsProcessing(true);
    try {
      const res = await fetch(`http://localhost:${selectedNodePort}/api/simulator/tamper/${selectedRecordId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: tamperMode }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionLog((prev) => [
          `[${new Date().toLocaleTimeString()}] ⚠ ATTACK EXECUTED on ${selectedRecordId}. Vector: ${tamperMode}. Mutated hash: ${data.tamperedHash}`,
          ...prev,
        ]);
        setCurrentFileHash(data.tamperedHash);
      }
    } catch (err: any) {
      alert(`Tamper action failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleRestore() {
    setIsProcessing(true);
    try {
      const res = await fetch(`http://localhost:${selectedNodePort}/api/simulator/restore/${selectedRecordId}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setActionLog((prev) => [
          `[${new Date().toLocaleTimeString()}] ✓ PRISTINE BACKUP RESTORED for ${selectedRecordId}. Hash restored: ${data.restoredHash}`,
          ...prev,
        ]);
        setCurrentFileHash(data.restoredHash);
      }
    } catch (err: any) {
      alert(`Restore action failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }

  const isTampered = currentFileHash && initialTargetHash && currentFileHash !== initialTargetHash;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 uppercase tracking-wider">
            <span>⚡</span> Forensic Security Testing
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Tamper Simulation &amp; Bit-Flipping Lab
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Demonstrate how a single bit modification in an off-chain AES-256-GCM record instantly triggers on-chain SHA-256 integrity alerts.
          </p>
        </div>

        <Link
          href="/doctor?patientHash=0x69c2fcaeb8ca20eefe591027426a4863b22f29312bb0e55597178eae3bc56872"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2 rounded-lg transition shadow-sm"
        >
          View in Doctor Portal →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attack Controls */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Target Node &amp; Corruption Vector
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold block text-slate-700 mb-1.5">Target Hospital Node</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedNodePort(5001);
                    setSelectedRecordId('REC-APOLLO-001');
                  }}
                  className={`p-3 rounded-lg border text-left transition ${
                    selectedNodePort === 5001
                      ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-semibold shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="block text-xs font-bold">Node A (:5001)</span>
                  <span className="text-[11px] text-slate-500">Apollo Speciality</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedNodePort(5002);
                    setSelectedRecordId('REC-FORTIS-002');
                  }}
                  className={`p-3 rounded-lg border text-left transition ${
                    selectedNodePort === 5002
                      ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-semibold shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="block text-xs font-bold">Node B (:5002)</span>
                  <span className="text-[11px] text-slate-500">Fortis Healthcare</span>
                </button>
              </div>
            </div>

            <div>
              <label className="font-semibold block text-slate-700 mb-1.5">Target Document Record ID</label>
              <input
                type="text"
                value={selectedRecordId}
                onChange={(e) => setSelectedRecordId(e.target.value.trim())}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-mono text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold block text-slate-700 mb-1.5">Attack Injection Vector</label>
              <select
                value={tamperMode}
                onChange={(e) => setTamperMode(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="ciphertext">Mutate Base64 Ciphertext (Bit-flip encrypted bytes)</option>
                <option value="authTag">Corrupt GCM Authentication Tag (Invalidate AEAD MAC)</option>
              </select>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={handleTamper}
                disabled={isProcessing}
                className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white font-medium py-2.5 rounded-lg text-xs shadow-sm transition"
              >
                ⚡ Execute Tamper Attack
              </button>

              <button
                type="button"
                onClick={handleRestore}
                disabled={isProcessing}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-medium py-2.5 rounded-lg text-xs shadow-sm transition"
              >
                ↺ Restore Pristine State
              </button>
            </div>
          </div>
        </div>

        {/* State & Console Log */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Real-Time Node State &amp; Forensic Log
          </h2>

          <div className="space-y-3">
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 font-mono text-xs space-y-2">
              <div>
                <span className="text-[10px] text-slate-400 font-sans font-semibold uppercase block">Disk SHA-256 Checksum</span>
                <span className={`font-semibold break-all text-xs ${isTampered ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {currentFileHash || 'Reading file...'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] text-slate-400 font-sans font-semibold uppercase block">Expected On-Chain Target Hash</span>
                <span className="font-semibold text-slate-800 break-all text-xs">
                  {initialTargetHash || 'Loading...'}
                </span>
              </div>
            </div>

            {/* Event Console */}
            <div>
              <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider mb-1.5">
                Audit Event Log
              </span>
              <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px] h-40 overflow-y-auto space-y-1">
                {actionLog.length === 0 ? (
                  <span className="text-slate-500">&gt; System standing by. Click "Execute Tamper Attack" to observe live mutation.</span>
                ) : (
                  actionLog.map((log, idx) => (
                    <div key={idx} className="leading-tight text-slate-300">{log}</div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
