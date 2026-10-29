'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { DoctorProvider, useDoctor } from '../lib/doctor-context';
import Navbar from './Navbar';

function LayoutShell({ children }: { children: React.ReactNode }) {
  const { activeDoctor, setActiveDoctor } = useDoctor();
  const [clock, setClock] = useState<string>('');
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    setClock(new Date().toLocaleTimeString());
    const interval = setInterval(() => setClock(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(interval);
  }, []);

  // For the homepage, render completely full-bleed without outer margins, white bars, or duplicate navbar
  if (isHome) {
    return (
      <main className="w-full min-h-screen bg-[#07090e] text-slate-100">
        {children}
      </main>
    );
  }

  // For subpages (/book, /doctor, /blockchain, /emergency, etc.), render dark unified layout
  return (
    <div className="min-h-screen bg-[#07090e] flex flex-col justify-between text-slate-100 antialiased font-sans">
      <Navbar activeDoctor={activeDoctor} onDoctorChange={setActiveDoctor} />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      <footer className="bg-[#0a0d14] border-t border-white/10 py-3 px-4 sm:px-6 lg:px-8 text-xs text-slate-400 select-none">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 flex-wrap text-[11px] font-mono">
            <span className="flex items-center gap-1.5 font-medium text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Ledger: Online (Ethereum Consortium)
            </span>
            <span className="text-white/20">|</span>
            <span>Contract: <code className="bg-white/10 px-1 py-0.5 rounded text-cyan-300">MedicalRecordLedger.sol</code></span>
            <span className="text-white/20">|</span>
            <span>Cipher: <strong className="text-white">AES-256-GCM (Zero-PII)</strong></span>
            <span className="text-white/20">|</span>
            <span className="text-indigo-400 font-semibold">HIPAA &amp; DPDP Act Compliant</span>
          </div>
          <div className="font-mono text-slate-500 text-[11px]">
            {clock || '00:00:00'}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <DoctorProvider>
      <LayoutShell>{children}</LayoutShell>
    </DoctorProvider>
  );
}
