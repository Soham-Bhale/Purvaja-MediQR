'use client';

import React, { useState, useEffect } from 'react';
import { DoctorProvider, useDoctor } from '../lib/doctor-context';
import Navbar from './Navbar';

function LayoutShell({ children }: { children: React.ReactNode }) {
  const { activeDoctor, setActiveDoctor } = useDoctor();
  const [clock, setClock] = useState<string>('');

  useEffect(() => {
    setClock(new Date().toLocaleTimeString());
    const interval = setInterval(() => setClock(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-800 antialiased font-sans">
      <Navbar activeDoctor={activeDoctor} onDoctorChange={setActiveDoctor} />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-3 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 select-none">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 font-medium text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Ledger: Online (Paris EVM)
            </span>
            <span className="text-slate-300">|</span>
            <span>Contract: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">0x5FbDB2...80aa3</code></span>
            <span className="text-slate-300">|</span>
            <span>Cipher: <strong>AES-256-GCM (128-bit MAC)</strong></span>
            <span className="text-slate-300">|</span>
            <span className="text-indigo-700 font-semibold">HIPAA & India DPDP Compliant</span>
          </div>
          <div className="font-mono text-slate-400">
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
