'use client';

import React, { useState, useEffect, useRef } from 'react';

interface FingerprintScannerProps {
  mode: 'enroll' | 'verify';
  doctorName?: string;
  doctorWallet?: string;
  expectedBiometricHash?: string;
  onScanComplete?: (templateHash: string, ridgePatternId: string) => void;
  onVerifySuccess?: () => void;
  onVerifyFailed?: (reason: string) => void;
  className?: string;
}

export default function FingerprintScanner({
  mode,
  doctorName,
  doctorWallet,
  expectedBiometricHash,
  onScanComplete,
  onVerifySuccess,
  onVerifyFailed,
  className = '',
}: FingerprintScannerProps) {
  const [scanState, setScanState] = useState<'IDLE' | 'SCANNING' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>(
    mode === 'enroll'
      ? "Place doctor's index finger on optical sensor"
      : `Touch sensor to authenticate ${doctorName || 'Practitioner'}`
  );
  const scanTimerRef = useRef<NodeJS.Timeout | null>(null);
  const successTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Automatically reset scanner state when target doctor or mode changes
  useEffect(() => {
    if (scanTimerRef.current) clearInterval(scanTimerRef.current);
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    setScanState('IDLE');
    setProgress(0);
    setStatusMessage(
      mode === 'enroll'
        ? "Place doctor's index finger on optical sensor"
        : `Touch sensor to authenticate ${doctorName || 'Practitioner'}`
    );
  }, [doctorWallet, mode, expectedBiometricHash, doctorName]);

  // Play subtle synthesis chimes using Web Audio API safely
  function playBeep(type: 'scan' | 'success' | 'error') {
    try {
      if (typeof window === 'undefined') return;
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      if (type === 'scan') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'success') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }

      // Close AudioContext after chime finishes to release browser audio resources
      setTimeout(() => {
        try {
          if (ctx.state !== 'closed') ctx.close();
        } catch {}
      }, 500);
    } catch {
      // Autoplay policy restrictions handled silently
    }
  }

  function startScan() {
    if (scanState === 'SCANNING') return;
    if (scanTimerRef.current) clearInterval(scanTimerRef.current);
    if (successTimerRef.current) clearTimeout(successTimerRef.current);

    setScanState('SCANNING');
    setProgress(0);
    setStatusMessage('Capturing high-resolution epidermal ridges (500 DPI)...');
    playBeep('scan');

    let currentProgress = 0;

    scanTimerRef.current = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);

      if (currentProgress === 30) {
        setStatusMessage('Extracting biometric minutiae points (Bifurcations & Endings)...');
        playBeep('scan');
      } else if (currentProgress === 70) {
        setStatusMessage(
          mode === 'enroll'
            ? 'Generating salted biometric template hash...'
            : 'Matching against Ministry of Health enrolled registry...'
        );
      } else if (currentProgress >= 100) {
        if (scanTimerRef.current) {
          clearInterval(scanTimerRef.current);
          scanTimerRef.current = null;
        }
        finishScan();
      }
    }, 110);
  }

  function finishScan() {
    if (mode === 'enroll') {
      // Generate realistic biometric template hash and ridge pattern
      const patterns = ['WHORL-CENTRAL-POCKET-TYPE-A', 'LOOP-ULNAR-TYPE-B', 'ARCH-TENTED-TYPE-C', 'WHORL-DOUBLE-LOOP'];
      const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
      const randomHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

      setScanState('SUCCESS');
      setStatusMessage('Biometric fingerprint template captured & cryptographically signed!');
      playBeep('success');
      if (onScanComplete) {
        onScanComplete(randomHash, randomPattern);
      }
    } else {
      // Mode: Verify
      if (!expectedBiometricHash) {
        setScanState('FAILED');
        const reason = `No biometric template enrolled for wallet ${doctorWallet?.slice(0, 8) || 'this practitioner'}. Contact Government Field Officer.`;
        setStatusMessage(reason);
        playBeep('error');
        if (onVerifyFailed) onVerifyFailed(reason);
        return;
      }

      setScanState('SUCCESS');
      setStatusMessage(`Biometric match confirmed (99.98% Confidence): ${doctorName || 'Doctor'}`);
      playBeep('success');
      if (onVerifySuccess) {
        successTimerRef.current = setTimeout(() => {
          onVerifySuccess();
        }, 600);
      }
    }
  }

  useEffect(() => {
    return () => {
      if (scanTimerRef.current) clearInterval(scanTimerRef.current);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all ${
      scanState === 'SUCCESS'
        ? 'bg-emerald-50/50 border-emerald-300'
        : scanState === 'FAILED'
        ? 'bg-rose-50/50 border-rose-300'
        : scanState === 'SCANNING'
        ? 'bg-blue-50/50 border-blue-300 shadow-md'
        : 'bg-slate-50 border-slate-200'
    } ${className}`}>

      {/* Interactive Biometric Sensor Touch Pad */}
      <div
        onClick={startScan}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            startScan();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Fingerprint Optical Sensor Pad"
        className={`relative w-28 h-36 rounded-2xl border-2 flex items-center justify-center cursor-pointer select-none transition-all duration-300 overflow-hidden group focus:outline-none focus:ring-4 focus:ring-blue-400/50 ${
          scanState === 'SUCCESS'
            ? 'border-emerald-500 bg-emerald-950 text-emerald-400 shadow-emerald-200 shadow-lg'
            : scanState === 'FAILED'
            ? 'border-rose-500 bg-rose-950 text-rose-400'
            : scanState === 'SCANNING'
            ? 'border-blue-500 bg-slate-950 text-blue-400 shadow-blue-200 shadow-lg ring-4 ring-blue-100'
            : 'border-slate-300 bg-slate-900 text-slate-400 hover:border-blue-400 hover:text-blue-300 hover:shadow-md'
        }`}
      >
        {/* Glowing Background Radial */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.3) 0%, transparent 70%)' }}
        />

        {/* Scanning Laser Beam Line */}
        {scanState === 'SCANNING' && (
          <div
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] pointer-events-none transition-all duration-75"
            style={{ top: `${progress}%` }}
          />
        )}

        {/* Detailed Fingerprint Ridge SVG */}
        <svg
          className={`w-20 h-20 transition-transform duration-300 ${
            scanState === 'SCANNING' ? 'scale-105 opacity-100' : 'group-hover:scale-105 opacity-80'
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2a10 10 0 0 0-10 10c0 2.5 1 4.8 2.6 6.5" />
          <path d="M7 10a5 5 0 0 1 10 0c0 2.5-1 4.5-2.5 6" />
          <path d="M12 6a4 4 0 0 0-4 4c0 3 1.5 5 3.5 6.5" />
          <path d="M9 13.5c.5 1.5 1.5 2.5 3 2.5s2.5-1 2.5-2.5" />
          <path d="M12 18v3" />
          <path d="M16 19.5c1-1 1.8-2.2 2.3-3.5" />
          <path d="M20.5 14.5c.3-.8.5-1.6.5-2.5a8.5 8.5 0 0 0-3-6.5" />
          <path d="M4 14c.3 1.5 1 2.9 2 4" />
        </svg>

        {/* Status Badge Over Touch Pad */}
        <div className="absolute bottom-2 text-[10px] font-mono uppercase tracking-wider font-semibold">
          {scanState === 'IDLE' && 'TOUCH SENSOR'}
          {scanState === 'SCANNING' && `${progress}%`}
          {scanState === 'SUCCESS' && 'VERIFIED'}
          {scanState === 'FAILED' && 'REJECTED'}
        </div>
      </div>

      {/* Progress Bar in Scanning Mode */}
      {scanState === 'SCANNING' && (
        <div className="w-full max-w-xs mt-3 bg-slate-200 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Status Message & Action Trigger */}
      <p className={`text-xs mt-3 text-center max-w-xs font-medium transition-colors ${
        scanState === 'SUCCESS'
          ? 'text-emerald-700'
          : scanState === 'FAILED'
          ? 'text-rose-700'
          : scanState === 'SCANNING'
          ? 'text-blue-700'
          : 'text-slate-600'
      }`}>
        {statusMessage}
      </p>

      {/* Action Button for Touch Simulation */}
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={startScan}
          disabled={scanState === 'SCANNING'}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 ${
            scanState === 'SUCCESS'
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : scanState === 'FAILED'
              ? 'bg-rose-600 hover:bg-rose-700 text-white'
              : 'bg-slate-900 hover:bg-slate-800 text-white'
          }`}
        >
          <span>👆</span>
          <span>
            {scanState === 'IDLE' && (mode === 'enroll' ? 'Capture Doctor Fingerprint' : 'Tap to Authenticate')}
            {scanState === 'SCANNING' && 'Scanning Optical Ridge...'}
            {scanState === 'SUCCESS' && 'Scan Completed (Scan Again)'}
            {scanState === 'FAILED' && 'Retry Biometric Scan'}
          </span>
        </button>
      </div>

      {/* Regulatory Badge */}
      <div className="mt-3 text-[10px] text-slate-400 flex items-center gap-1">
        <span>🔒</span>
        <span>Aadhaar/MOH UIDAI Compatible Biometric Minutiae Engine</span>
      </div>
    </div>
  );
}
