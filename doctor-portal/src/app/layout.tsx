'use client';

import './globals.css';
import React, { useState, useEffect } from 'react';
import { DoctorProvider, useDoctor } from '../lib/doctor-context';
import Navbar from '../components/Navbar';

function LayoutShell({ children }: { children: React.ReactNode }) {
  const { activeDoctor, setActiveDoctor } = useDoctor();
  const [clock, setClock] = useState<string>('');

  useEffect(() => {
    setClock(new Date().toLocaleTimeString());
    const interval = setInterval(() => setClock(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#3a6ea5] p-2 flex flex-col justify-between font-sans">
      {/* Outer Application Window Frame */}
      <div className="swing-window max-w-7xl w-full mx-auto flex-1 flex flex-col overflow-hidden mb-2">
        <Navbar activeDoctor={activeDoctor} onDoctorChange={setActiveDoctor} />
        
        {/* Main Work Area Panel */}
        <main className="flex-1 p-3 bg-[#ece9d8] overflow-y-auto">
          {children}
        </main>

        {/* Classic Java Swing JStatusBar */}
        <footer className="bg-[#ece9d8] border-t-2 border-[#ffffff] p-1 flex flex-wrap items-center gap-1 select-none text-[10px] font-mono">
          <div className="status-cell flex-1 min-w-[120px]">
            STATUS: <strong className="text-green-800">ONLINE / CONSORTIUM READY</strong>
          </div>
          <div className="status-cell min-w-[200px]">
            LEDGER: <strong>0x5FbDB231... Paris EVM</strong>
          </div>
          <div className="status-cell min-w-[190px]">
            CIPHER: <strong>AES-256-GCM (128-bit TAG)</strong>
          </div>
          <div className="status-cell min-w-[160px]">
            COMPLIANCE: <strong>HIPAA / DPDP SECURE</strong>
          </div>
          <div className="status-cell min-w-[80px] text-right font-bold">
            {clock || '00:00:00'}
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>MediQR Enterprise EMR Console (Java 8 Swing Runtime)</title>
        <meta name="description" content="Authentic distributed healthcare archive and tamper-proof blockchain ledger" />
      </head>
      <body>
        <DoctorProvider>
          <LayoutShell>{children}</LayoutShell>
        </DoctorProvider>
      </body>
    </html>
  );
}
