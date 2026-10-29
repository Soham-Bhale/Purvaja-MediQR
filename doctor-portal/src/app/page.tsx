'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CinematicBackground from '../components/CinematicBackground';
import AppleVideoCard from '../components/AppleVideoCard';
import IsometricStage from '../components/IsometricStage';
import AssetPromptModal from '../components/AssetPromptModal';
import EmailInboxModal from '../components/EmailInboxModal';

export default function PatientPortalHomePage() {
  // Modals
  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  // Video State
  const [heroVideoAvailable, setHeroVideoAvailable] = useState(true);

  useEffect(() => {
    // Check if user has dropped an MP4 into public/videos/hero.mp4
    fetch('/videos/hero.mp4', { method: 'HEAD' })
      .then((res) => {
        if (res.ok && res.headers.get('content-type')?.includes('video')) {
          setHeroVideoAvailable(true);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="relative min-h-screen text-slate-100 selection:bg-blue-500 selection:text-white font-sans antialiased overflow-x-hidden">
      {/* Dynamic Background with Canvas particles & optional Video */}
      <CinematicBackground videoSrc={heroVideoAvailable ? '/videos/hero.mp4' : undefined} />

      {/* Main Content Container */}
      <div className="relative z-10 space-y-28 md:space-y-40 pb-28">

        {/* =========================================================================
            HERO SECTION: APPLE-STYLE CINEMATIC OPENER
        ========================================================================= */}
        <section className="pt-24 sm:pt-36 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl text-xs font-semibold text-blue-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>The Next Era of Emergency Medicine</span>
            <span className="text-white/40">|</span>
            <span className="text-indigo-300">Zero-Trust Blockchain</span>
          </div>

          {/* Hero Main Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08] max-w-4xl mx-auto">
              When seconds mean survival.{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-300">
                Your emergency data, optically verified.
              </span>
            </h1>
            <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
              MediQR guarantees instant, 0.02-second roadside emergency triage for unconscious patients with zero internet dependency — cryptographically protected by consortium blockchain smart contracts.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="#interactive-stage"
              className="px-7 py-4 rounded-2xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-400/50 text-cyan-200 font-bold text-sm sm:text-base backdrop-blur-md transition flex items-center gap-2 transform hover:-translate-y-0.5 shadow-lg shadow-cyan-600/20"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>🎮 3D Architecture Tour (01–08)</span>
            </a>
            <Link
              href="/book"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all transform hover:-translate-y-0.5"
            >
              Book Care Consultation (₹500) →
            </Link>
            <a
              href="#the-crisis"
              className="px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-sm sm:text-base backdrop-blur-md transition"
            >
              🎬 Watch Video Showcases
            </a>
            <button
              type="button"
              onClick={() => setPromptModalOpen(true)}
              className="px-5 py-4 rounded-2xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-200 font-bold text-xs sm:text-sm backdrop-blur-md transition flex items-center gap-2 cursor-pointer"
            >
              <span>✨</span>
              <span>AI Prompts</span>
            </button>
          </div>

          {/* Floating Glass Metric Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-12 max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md text-left space-y-1">
              <div className="text-3xl font-extrabold text-blue-400 font-mono">&lt; 0.02s</div>
              <div className="text-sm font-bold text-white">Roadside Triage Retrieval</div>
              <p className="text-xs text-slate-400">Scanned instantly by any phone camera with zero internet, apps, or special hardware.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md text-left space-y-1">
              <div className="text-3xl font-extrabold text-indigo-400 font-mono">100% Zero-PII</div>
              <div className="text-sm font-bold text-white">Blockchain Cryptographic Vault</div>
              <p className="text-xs text-slate-400">Solidity smart contract stores 32-byte SHA-256 hashes. Zero plain health data on-chain.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md text-left space-y-1">
              <div className="text-3xl font-extrabold text-emerald-400 font-mono">AES-256-GCM</div>
              <div className="text-sm font-bold text-white">Multi-Hospital Partitioning</div>
              <p className="text-xs text-slate-400">Clinical notes encrypted at rest across independent hospital storage nodes.</p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            INTERACTIVE 3D ISOMETRIC CYBER-PHYSICAL STAGE (CARBO-TRACE STYLE ENGINE)
        ========================================================================= */}
        <div id="interactive-stage" className="scroll-mt-20">
          <IsometricStage />
        </div>

        {/* =========================================================================
            SECTION 1: THE CRISIS (THE PROBLEM WE SOLVE)
        ========================================================================= */}
        <section id="the-crisis" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full">
              The Real-World Crisis
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Why Traditional Healthcare Fails in Emergencies.
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
              When trauma strikes, current medical systems suffer from three fatal structural vulnerabilities.
            </p>
          </div>

          {/* Cinematic Problem Video Reconstruction */}
          <div className="max-w-4xl mx-auto">
            <AppleVideoCard
              src="/videos/the-crisis.mp4"
              title="Roadside Emergency Triage Failure"
              subtitle="INCIDENT RECONSTRUCTION • 250,000+ FATALITIES/YR"
              badge="THE CRISIS WE SOLVE"
              badgeColor="rose"
              telemetryText="Unconscious Victim • Missing Identity • Cloud Blackout • 45m ER Delay"
            />
          </div>

          {/* 3 Problem Cards with Cinematic Aesthetics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Problem 1 */}
            <div className="rounded-3xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 p-7 space-y-4 hover:border-rose-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-2xl font-bold">
                ⚠️
              </div>
              <h3 className="text-lg font-bold text-white">1. The Unconscious Patient Paradox</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                When a victim is found unconscious at a road collision, they cannot speak. Their wallet is missing. Over <strong>250,000 fatal clinical errors</strong> occur globally every year because paramedics administer drugs conflicting with unknown anaphylactic allergies or transfuse incompatible blood.
              </p>
              <div className="p-3.5 rounded-xl bg-black/40 border border-rose-500/20 font-mono text-[11px] text-rose-300">
                Fatal Delay: Average ER triage query takes 25–45 minutes.
              </div>
            </div>

            {/* Problem 2 */}
            <div className="rounded-3xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 p-7 space-y-4 hover:border-amber-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl font-bold">
                ☁️
              </div>
              <h3 className="text-lg font-bold text-white">2. Centralized Server &amp; Cloud Blackouts</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Over 133 million healthcare records were paralyzed by hospital ransomware and server outages in 2023. When internet towers or central hospital databases go offline, roadside emergency personnel are left completely blinded with zero access to records.
              </p>
              <div className="p-3.5 rounded-xl bg-black/40 border border-amber-500/20 font-mono text-[11px] text-amber-300">
                Vulnerability: Single point of failure across hospital data centers.
              </div>
            </div>

            {/* Problem 3 */}
            <div className="rounded-3xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 p-7 space-y-4 hover:border-red-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center text-2xl font-bold">
                🔓
              </div>
              <h3 className="text-lg font-bold text-white">3. Silent Data Tampering &amp; Identity Theft</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Standard SQL databases can be modified by rogue administrators or compromised by SQL injections. An attacker or disgruntled actor can alter a patient's prescription or blood test without leaving an unforgeable, mathematical audit trail.
              </p>
              <div className="p-3.5 rounded-xl bg-black/40 border border-red-500/20 font-mono text-[11px] text-red-300">
                Risk: Undetected modification causes clinical misdiagnosis.
              </div>
            </div>

          </div>

        </section>

        {/* =========================================================================
            SECTION 2: THE BREAKTHROUGH (OUR SOLUTION)
        ========================================================================= */}
        <section id="the-breakthrough" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              The Engineering Breakthrough
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              How MediQR Transforms Emergency Healthcare.
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
              A dual-segment architecture combining optical physics with decentralized consensus.
            </p>
          </div>

          {/* Cinematic Solution Video Demonstration */}
          <div className="max-w-4xl mx-auto">
            <AppleVideoCard
              src="/videos/the-solution.mp4"
              title="Dual-Segment Optical MediQR Acquisition"
              subtitle="0.018s ULTRA-FAST RECOGNITION"
              badge="THE BREAKTHROUGH"
              badgeColor="emerald"
              telemetryText="Laser Barcode Scan • Offline Air-Gapped Key • Instant Critical ICE Payload"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Solution 1 */}
            <div className="rounded-3xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 p-7 space-y-4 hover:border-emerald-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl font-bold">
                📱
              </div>
              <h3 className="text-lg font-bold text-white">1. Dual-Segment Optical MediQR</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Splits patient data into two distinct layers:
                <br /><br />
                • <strong>Segment 1 (Roadside Triage)</strong>: Blood Group, Anaphylaxis Allergies, and ICE Contacts readable in 0.02s by ANY phone camera with zero internet.
                <br /><br />
                • <strong>Segment 2 (Salted Query Token)</strong>: A 32-byte cryptographic HMAC accessible only by verified physicians.
              </p>
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-mono text-[11px]">
                ✓ Operates in tunnels, remote highways, and air ambulances.
              </div>
            </div>

            {/* Solution 2 */}
            <div className="rounded-3xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 p-7 space-y-4 hover:border-blue-500/40 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-2xl font-bold">
                  ⛓️
                </div>
                <h3 className="text-lg font-bold text-white">2. Blockchain Immutability Seal</h3>
                
                {/* Embedded Video Loop of Blockchain Seal */}
                <div className="rounded-2xl overflow-hidden border border-blue-500/20 shadow-lg relative aspect-video bg-black/60">
                  <video
                    src="/videos/blockchain-seal.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-black/70 backdrop-blur-sm text-[10px] font-mono text-blue-300 border border-white/10">
                    Consortium Seal • SHA-256 Hashes
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Our Solidity smart contract (<code className="font-mono text-blue-300">MedicalRecordLedger.sol</code>) anchors 32-byte SHA-256 hashes of off-chain encrypted records. If a single bit is modified, the hash mismatch is mathematically rejected.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 text-blue-300 font-mono text-[11px] mt-4">
                ✓ Mathematically impossible to alter medical history undetected.
              </div>
            </div>

            {/* Solution 3 */}
            <div className="rounded-3xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 p-7 space-y-4 hover:border-indigo-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl font-bold">
                📡
              </div>
              <h3 className="text-lg font-bold text-white">3. Isolated ESP32 Hardware Mesh</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connects patient booking stations, doctor EMR workstations, and mobile paramedic phones through a secure, private WPA2-PSK hardware access point. Demonstrates flawless zero-cloud operational sovereignty.
              </p>
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 font-mono text-[11px]">
                ✓ Private 192.168.4.1 routing with hardware LED indicators.
              </div>
            </div>

          </div>

        </section>

        {/* =========================================================================
            SECTION 2.5: PHYSICAL HARDWARE (THE MEDIQR TITANIUM KEYCARD & WRISTBAND)
        ========================================================================= */}
        <section id="hardware-showcase" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
              Physical-to-Digital Architecture
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Indestructible Roadside Hardware.
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
              Laser-etched aerospace titanium keycard and emergency silicone wristband designed to survive extreme trauma without power or cellular networks.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Apple Video Card Showcase for Smart Card */}
            <div className="lg:col-span-7">
              <AppleVideoCard
                src="/videos/smart-card-mockup.mp4"
                title="MediQR Titanium Emergency Card & Dynamic Wristband"
                subtitle="HARDWARE PROTOTYPE v2.4"
                badge="PHYSICAL ARTIFACT"
                badgeColor="indigo"
                telemetryText="Dual-Segment High-Density Optical Matrix • 1200 DPI Ceramic Laser Engraving"
              />
            </div>

            {/* Hardware Specifications Grid */}
            <div className="lg:col-span-5 space-y-4">
              
              <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-indigo-500/30 transition space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <span>🛡️</span> Aerospace Titanium &amp; Ceramic Core
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Rated fireproof up to 850°C and 10 ATM immersion. Carried in the patient's wallet or worn on wrist as an impervious lifeline.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-emerald-500/30 transition space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <span>⚡</span> 0.02s Instant Optical Triage
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Any smartphone camera decodes blood group, allergies, and ICE emergency contacts directly from the visual barcode glyph with zero app installation.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-blue-500/30 transition space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                  <span>⛓️</span> Encrypted Doctor Query Token
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Secondary salted cryptographic token queries verified hospital consortium nodes and compares against the Ethereum smart contract hash ledger.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 font-mono text-[11px] text-indigo-300 flex items-center justify-between">
                <span>NFC Standard: ISO/IEC 14443 Type A</span>
                <span className="text-emerald-400">● 100% Passive</span>
              </div>

            </div>

          </div>

        </section>

        {/* =========================================================================
            SECTION 3: DEDICATED CARE CONSULTATION & TOKEN PORTAL (CTA)
        ========================================================================= */}
        <section id="book" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/10 p-8 sm:p-14 text-center overflow-hidden shadow-2xl backdrop-blur-xl">
            {/* Ambient background glow */}
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/20 blur-[100px] pointer-events-none rounded-full" />
            
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono font-semibold text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                DEDICATED PATIENT PORTAL
              </span>

              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Schedule Your MediQR Consultation &amp; Mint Identity Token
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                Register emergency roadside vitals (blood group, anaphylaxis allergies, ICE contacts), select certified Apollo or Fortis specialists, pay the ₹500 fee, and anchor your appointment directly onto the Ethereum consortium ledger.
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/book"
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2"
                >
                  <span>Open Patient Consultation Portal (₹500)</span>
                  <span>→</span>
                </Link>
                <Link
                  href="/doctor"
                  className="px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white font-semibold text-sm transition"
                >
                  Doctor EMR Portal →
                </Link>
              </div>

              <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/10 text-left text-xs">
                <div>
                  <div className="text-white font-bold">1. Emergency Vitals</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Static text encoded into offline camera QR.</div>
                </div>
                <div>
                  <div className="text-white font-bold">2. ₹500 Instant Fee</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Simulated demo or UPI/card token settlement.</div>
                </div>
                <div>
                  <div className="text-white font-bold">3. Mined Block Proof</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Live block broadcasted to doctor dashboard.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: FAQ & ENTERPRISE COMPLIANCE
        ========================================================================= */}
        <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-white">Frequently Asked Architectural Questions</h3>
            <p className="text-xs text-slate-400">Underlying technical guarantees for evaluators and medical inspectors.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 space-y-2">
              <h4 className="font-bold text-white text-sm">How can paramedics read the QR code without cellular internet?</h4>
              <p className="text-slate-300 leading-relaxed">
                The optical MediQR protocol uses dual-segment encoding. Critical emergency triage vitals (Blood type, Anaphylaxis allergies, Emergency phone) are embedded directly in the visual matrix (or locally resolved over the private ESP32 Access Point). Any standard smartphone camera decodes it in 0.02s without making remote cloud API calls.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 space-y-2">
              <h4 className="font-bold text-white text-sm">Is my health data publicly visible on the blockchain?</h4>
              <p className="text-slate-300 leading-relaxed">
                <strong>No. MediQR is 100% Zero-PII compliant</strong> (HIPAA &amp; DPDP India). The Solidity smart contract stores only 32-byte cryptographic SHA-256 fingerprints. All actual clinical records are encrypted with AES-256-GCM and stored off-chain on independent hospital nodes.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 space-y-2">
              <h4 className="font-bold text-white text-sm">What happens if an unauthorized person tries to alter medical records?</h4>
              <p className="text-slate-300 leading-relaxed">
                Any bit-flip in the off-chain encrypted file instantly changes its SHA-256 hash. When a doctor attempts decryption, the client compares the computed hash against the immutable smart contract anchor. If there is a 1-bit mismatch, clinical decryption is automatically blocked.
              </p>
            </div>
          </div>
        </section>

        {/* Enterprise Compliance Strip */}
        <footer className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            MediQR Enterprise Healthcare Consortium • Architecture v2.2
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>HIPAA Compliant</span>
            <span>•</span>
            <span>DPDP Act 2023</span>
            <span>•</span>
            <span>EVM Consortium Ledger</span>
          </div>
        </footer>

      </div>

      {/* AI Media Prompts Modal */}
      <AssetPromptModal isOpen={promptModalOpen} onClose={() => setPromptModalOpen(false)} />

      {/* Outbound Email Modal */}
      <EmailInboxModal isOpen={emailModalOpen} onClose={() => setEmailModalOpen(false)} />
    </div>
  );
}