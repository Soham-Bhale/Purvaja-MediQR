'use client';

import dynamic from 'next/dynamic';

const DoctorPortalWorkstation = dynamic(
  () => import('../../components/DoctorPortalWorkstation'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[65vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 text-3xl animate-pulse shadow-inner shadow-blue-500/10">
          🩺
        </div>
        <div className="space-y-1.5">
          <p className="font-mono text-sm font-bold text-white tracking-wide">
            Initializing Doctor EMR Workstation...
          </p>
          <p className="font-mono text-xs text-slate-400">
            Establishing biometric driver boundary &amp; zero-trust air-gapped encryption
          </p>
        </div>
      </div>
    ),
  }
);

export default function DoctorPortalPage() {
  return <DoctorPortalWorkstation />;
}
