import React from 'react';

interface HashIntegrityBadgeProps {
  isTamperFree: boolean;
  expectedHash: string;
  computedHash: string;
  storageURI: string;
  hospitalNodeId?: string;
  tamperReason?: string;
}

export default function HashIntegrityBadge({
  isTamperFree,
  expectedHash,
  computedHash,
  storageURI,
  hospitalNodeId,
  tamperReason,
}: HashIntegrityBadgeProps) {
  if (isTamperFree) {
    return (
      <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/80 text-emerald-950 mb-4 shadow-sm">
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-emerald-200">
          <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            ✓
          </div>
          <div>
            <span className="font-semibold text-sm text-emerald-900 tracking-tight">
              Tamper-Free: SHA-256 Fingerprint Verified On-Chain
            </span>
            <span className="ml-2 text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">100% Match</span>
          </div>
        </div>

        <p className="text-xs text-emerald-800 mt-2">
          Off-chain document checksum matches the immutable on-chain record in <code className="font-mono bg-emerald-100 px-1 py-0.5 rounded text-emerald-900">MedicalRecordLedger.sol</code>. In-memory AES-256-GCM decryption granted.
        </p>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
          <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-200">
            <span className="text-[10px] text-slate-500 font-semibold block uppercase">Target Hash (On-Chain)</span>
            <span className="text-emerald-900 font-medium truncate block select-all mt-0.5">{expectedHash}</span>
          </div>
          <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-200">
            <span className="text-[10px] text-slate-500 font-semibold block uppercase">Computed Document Hash (SHA-256)</span>
            <span className="text-emerald-900 font-medium truncate block select-all mt-0.5">{computedHash}</span>
          </div>
        </div>
      </div>
    );
  }

  // TAMPER DETECTED
  return (
    <div className="p-4 rounded-xl border-2 border-rose-300 bg-rose-50 text-rose-950 mb-4 shadow-sm animate-pulse">
      <div className="flex items-center gap-2.5 pb-2.5 border-b border-rose-200">
        <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
          !
        </div>
        <div>
          <span className="font-bold text-sm text-rose-900 tracking-tight">
            Security Alert: Cryptographic Tampering Detected
          </span>
          <span className="ml-2 text-xs bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full font-bold">Integrity Violation</span>
        </div>
      </div>

      <p className="text-xs text-rose-900 font-medium mt-2">
        CRITICAL: The SHA-256 checksum of the off-chain hospital file differs from the immutable ledger! Decryption was aborted immediately to protect patient safety.
      </p>

      {tamperReason && (
        <div className="mt-2 text-xs bg-rose-100/90 p-2 rounded-lg border border-rose-200 text-rose-950 font-mono">
          Forensic Cause: {tamperReason}
        </div>
      )}

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
        <div className="bg-white p-2.5 rounded-lg border border-slate-300">
          <span className="text-[10px] text-slate-500 font-semibold block uppercase">Expected On-Chain Fingerprint</span>
          <span className="text-slate-800 font-medium truncate block select-all mt-0.5">{expectedHash}</span>
        </div>
        <div className="bg-white p-2.5 rounded-lg border-2 border-rose-400 bg-rose-50/50">
          <span className="text-[10px] text-rose-700 font-semibold block uppercase">Mutated Document Hash</span>
          <span className="text-rose-700 font-bold truncate block select-all mt-0.5">{computedHash}</span>
        </div>
      </div>
    </div>
  );
}
