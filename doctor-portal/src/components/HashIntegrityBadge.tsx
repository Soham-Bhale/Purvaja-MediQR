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
      <div className="sunken-panel p-3 border-2 border-green-800 bg-[#eef7ee] mb-3 text-black font-sans">
        <div className="flex items-center space-x-2 pb-2 border-b border-green-700">
          <span className="w-4 h-4 rounded-full bg-green-700 text-white font-bold text-[10px] flex items-center justify-center">
            ✓
          </span>
          <span className="font-bold text-xs text-green-900 uppercase tracking-wide">
            [VERIFIED] Tamper-Free: Document Fingerprint Matches Blockchain Ledger (100%)
          </span>
        </div>

        <p className="text-[11px] text-gray-700 mt-1.5 leading-tight">
          Cryptographic document checksum is verified against <strong>MedicalRecordLedger.sol</strong>. Authorized in-memory AES-256-GCM decryption.
        </p>

        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-mono">
          <div className="bg-white p-1.5 border border-gray-400">
            <span className="text-gray-500 font-bold block">TARGET HASH (ON-CHAIN):</span>
            <span className="text-green-900 font-bold truncate block select-all">{expectedHash}</span>
          </div>
          <div className="bg-white p-1.5 border border-gray-400">
            <span className="text-gray-500 font-bold block">COMPUTED DOCUMENT HASH (SHA-256):</span>
            <span className="text-green-900 font-bold truncate block select-all">{computedHash}</span>
          </div>
        </div>
      </div>
    );
  }

  // TAMPER DETECTED
  return (
    <div className="sunken-panel p-3 border-2 border-red-700 bg-[#ffebee] mb-3 text-black font-sans animate-pulse">
      <div className="flex items-center space-x-2 pb-2 border-b border-red-700">
        <span className="w-4 h-4 bg-red-700 text-white font-bold text-[11px] flex items-center justify-center">
          !
        </span>
        <span className="font-bold text-xs text-red-900 uppercase tracking-wide">
          [CRITICAL SECURITY ALERT] Tamper Detected: Record Compromised
        </span>
      </div>

      <p className="text-[11px] text-red-900 font-bold mt-1.5 leading-tight">
        INTEGRITY VIOLATION: The calculated SHA-256 fingerprint of the off-chain hospital file differs from the immutable blockchain ledger entry! In-memory decryption was ABORTED immediately.
      </p>

      {tamperReason && (
        <div className="mt-1.5 text-[10px] bg-red-100 p-1.5 border border-red-300 text-red-950 font-mono">
          Forensic Cause: {tamperReason}
        </div>
      )}

      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-mono">
        <div className="bg-white p-1.5 border border-gray-400">
          <span className="text-gray-500 font-bold block">EXPECTED ON-CHAIN FINGERPRINT:</span>
          <span className="text-gray-800 font-bold truncate block select-all">{expectedHash}</span>
        </div>
        <div className="bg-white p-1.5 border border-red-600 bg-red-50">
          <span className="text-red-700 font-bold block">⚠️ COMPROMISED FILE HASH (MUTATED):</span>
          <span className="text-red-700 font-bold truncate block select-all">{computedHash}</span>
        </div>
      </div>
    </div>
  );
}
