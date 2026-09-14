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

  return (
    <div className="space-y-3 font-sans text-black">
      {/* Header */}
      <div className="bg-[#0a246a] text-white p-2 border border-black flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-yellow-300 font-mono font-bold block">
            [ FORENSIC SECURITY LAB - BIT-FLIPPING INJECTION HARNESS ]
          </span>
          <h1 className="text-sm font-bold tracking-wide">
            Tamper Attack &amp; Integrity Verification Workbench
          </h1>
        </div>

        <Link
          href="/doctor?patientHash=0x69c2fcaeb8ca20eefe591027426a4863b22f29312bb0e55597178eae3bc56872"
          className="btn-swing-primary text-xs py-1"
        >
          🩺 Open Doctor Portal &gt;&gt;
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Attack Controls */}
        <fieldset className="swing-fieldset">
          <legend>Target Hospital Node &amp; Injection Vector</legend>
          <div className="space-y-2 pt-1">
            <div>
              <label className="text-[11px] font-bold block text-gray-700">Target Hospital Node:</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedNodePort(5001);
                    setSelectedRecordId('REC-APOLLO-001');
                  }}
                  className={`btn-swing text-left p-2 flex flex-col justify-start items-start w-full ${
                    selectedNodePort === 5001 ? 'bg-[#dcd8c4] border-t-[#404040] border-l-[#404040] border-b-white border-r-white font-bold' : ''
                  }`}
                >
                  <span className="text-xs">Node A (Port 5001)</span>
                  <span className="text-[10px] text-gray-600">Apollo Speciality</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedNodePort(5002);
                    setSelectedRecordId('REC-FORTIS-002');
                  }}
                  className={`btn-swing text-left p-2 flex flex-col justify-start items-start w-full ${
                    selectedNodePort === 5002 ? 'bg-[#dcd8c4] border-t-[#404040] border-l-[#404040] border-b-white border-r-white font-bold' : ''
                  }`}
                >
                  <span className="text-xs">Node B (Port 5002)</span>
                  <span className="text-[10px] text-gray-600">Fortis Healthcare</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold block text-gray-700">Record Document ID:</label>
              <input
                type="text"
                value={selectedRecordId}
                onChange={(e) => setSelectedRecordId(e.target.value.trim())}
                className="sunken-box w-full font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold block text-gray-700">Corruption Mode Vector:</label>
              <select
                value={tamperMode}
                onChange={(e) => setTamperMode(e.target.value as any)}
                className="sunken-box w-full text-xs"
              >
                <option value="ciphertext">Mutate Base64 Ciphertext (Bit-flip encrypted bytes)</option>
                <option value="authTag">Corrupt GCM Authentication Tag (Invalidate AEAD MAC)</option>
              </select>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={handleTamper}
                disabled={isProcessing}
                className="btn-swing text-red-800 font-bold flex-1 py-1.5 text-xs"
              >
                ⚡ Execute File Tampering
              </button>

              <button
                type="button"
                onClick={handleRestore}
                disabled={isProcessing}
                className="btn-swing text-green-800 font-bold flex-1 py-1.5 text-xs"
              >
                ↺ Restore Pristine File
              </button>
            </div>
          </div>
        </fieldset>

        {/* State & Console Log */}
        <fieldset className="swing-fieldset flex flex-col justify-between">
          <legend>[ Hospital Node State &amp; Event Terminal ]</legend>
          <div className="space-y-2">
            <div className="bg-white p-2 border border-gray-400 font-mono text-[10px] space-y-1">
              <div>
                <span className="text-gray-500 font-bold block">CURRENT SHA-256 OF FILE ON DISK:</span>
                <span className="text-red-700 font-bold break-all">{currentFileHash || 'Reading file...'}</span>
              </div>
              <div className="pt-1 border-t border-gray-200">
                <span className="text-gray-500 font-bold block">EXPECTED ON-CHAIN TARGET HASH:</span>
                <span className="text-green-800 font-bold break-all">{initialTargetHash || 'Loading...'}</span>
              </div>
            </div>

            {/* Event Console */}
            <div>
              <span className="text-[10px] font-bold text-gray-600 block uppercase">Execution Event Terminal:</span>
              <div className="bg-black text-green-400 p-2 border border-gray-600 font-mono text-[10px] h-36 overflow-y-auto space-y-1">
                {actionLog.length === 0 ? (
                  <span className="text-gray-500">&gt; Standing by. Execute attack above to observe hash mutation.</span>
                ) : (
                  actionLog.map((log, idx) => (
                    <div key={idx} className="leading-tight">{log}</div>
                  ))
                )}
              </div>
            </div>
          </div>
        </fieldset>
      </div>
    </div>
  );
}
