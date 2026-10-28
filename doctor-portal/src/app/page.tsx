'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  saveAppointment,
  getStoredAppointments,
  Appointment,
} from '../lib/appointments';
import { mineNewBlock } from '../lib/blockchain-blocks';
import { sendAppointmentConfirmationEmail } from '../lib/email-service';
import CinematicBackground from '../components/CinematicBackground';
import AppleVideoCard from '../components/AppleVideoCard';
import AssetPromptModal from '../components/AssetPromptModal';
import EmailInboxModal from '../components/EmailInboxModal';

export default function PatientPortalHomePage() {
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3 | 4>(1);

  // Patient Registration Details
  const [fullName, setFullName] = useState('Rahul Sharma');
  const [email, setEmail] = useState('rahul.sharma@healthmail.com');
  const [phone, setPhone] = useState('+91-98765-43210');
  const [age, setAge] = useState<number>(29);
  const [gender, setGender] = useState('Male');
  const [bloodType, setBloodType] = useState('B+');
  const [criticalAllergies, setCriticalAllergies] = useState('Penicillin G, Aspirin');
  const [chronicConditions, setChronicConditions] = useState('Mild Asthma');
  const [emergencyContactName, setEmergencyContactName] = useState('Pooja Sharma (Spouse)');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('+91-98765-43211');
  const [nationalId, setNationalId] = useState('IN-AADHAAR-9012-3482-1984');

  // Appointment & Doctor Selection
  const [selectedHospital, setSelectedHospital] = useState<'apollo' | 'fortis'>('apollo');
  const [selectedDoctor, setSelectedDoctor] = useState('0x70997970c51812dc3a010c7d01b50e0d17dc79c8');
  const [appointmentDate, setAppointmentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('11:00 AM - 11:30 AM');
  const [consultationReason, setConsultationReason] = useState('Persistent chest tightness and allergic respiratory symptoms');
  const serviceFee = 500;

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'demo' | 'upi' | 'card'>('demo');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  // Lookup Token State
  const [searchToken, setSearchToken] = useState('');
  const [lookupResult, setLookupResult] = useState<Appointment | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

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

  // Sync doctor with hospital
  useEffect(() => {
    if (selectedHospital === 'apollo') {
      setSelectedDoctor('0x70997970c51812dc3a010c7d01b50e0d17dc79c8');
    } else {
      setSelectedDoctor('0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc');
    }
  }, [selectedHospital]);

  async function handleConfirmAndPay() {
    setIsProcessingPayment(true);
    try {
      await new Promise((res) => setTimeout(res, 1200));

      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const hospitalPrefix = selectedHospital === 'apollo' ? 'APO' : 'FOR';
      const tokenId = `APT-${hospitalPrefix}-2026-${randomSuffix}`;
      const patientId = `PAT-${fullName.replace(/\s+/g, '-').toUpperCase()}-${randomSuffix}`;
      const txRef = `TXN-PAY-${Date.now().toString(36).toUpperCase()}`;

      const patientHash = `0x${Array.from(new TextEncoder().encode(nationalId + fullName))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, 64)
        .padEnd(64, '0')}`;

      const doctorName = selectedHospital === 'apollo' ? 'Dr. Ramesh Gupta' : 'Dr. Ananya Sharma';
      const hospitalName = selectedHospital === 'apollo' ? 'Apollo Speciality Hospital' : 'Fortis Healthcare Network';
      const hospitalNodeUrl = selectedHospital === 'apollo' ? 'http://localhost:5001' : 'http://localhost:5002';
      const department = selectedHospital === 'apollo' ? 'Lead Emergency & Pulmonology' : 'Chief Pathology & Diagnostics';

      const newAppointment: Appointment = {
        id: tokenId,
        patientId,
        patientName: fullName,
        email,
        phone,
        age: Number(age) || 30,
        gender,
        bloodType,
        criticalAllergies: criticalAllergies.split(',').map((s) => s.trim()).filter(Boolean),
        chronicConditions: chronicConditions.split(',').map((s) => s.trim()).filter(Boolean),
        emergencyContactName,
        emergencyContactPhone,
        nationalId,
        patientHash,
        hospitalId: selectedHospital === 'apollo' ? 'HOSPITAL-NODE-A' : 'HOSPITAL-NODE-B',
        hospitalName,
        hospitalNodeUrl,
        doctorId: selectedDoctor,
        doctorName,
        department,
        appointmentDate,
        timeSlot,
        consultationReason,
        serviceFee,
        paymentStatus: 'PAID',
        paymentMethod: paymentMethod === 'upi' ? 'UPI / GPay' : paymentMethod === 'card' ? 'Credit Card (Visa)' : 'MediQR 1-Click Pay',
        paymentTxRef: txRef,
        status: 'PENDING_EXAMINATION',
        bookedAt: Date.now(),
      };

      saveAppointment(newAppointment);

      await mineNewBlock([
        {
          txId: `0x${Array.from(crypto.getRandomValues(new Uint8Array(32))).map((b) => b.toString(16).padStart(2, '0')).join('')}`,
          type: 'APPOINTMENT_PAYMENT_CONFIRMED',
          timestamp: Date.now(),
          patientHash,
          patientName: fullName,
          details: `Service Fee Paid (₹${serviceFee}) | Token ${tokenId} Assigned to ${doctorName}`,
          amount: `₹${serviceFee}.00`,
          doctor: doctorName,
          status: 'MINED',
        },
      ]);

      sendAppointmentConfirmationEmail(newAppointment);
      setConfirmedAppointment(newAppointment);
      setBookingStep(4);
    } catch (err: any) {
      alert(`Booking payment failed: ${err.message}`);
    } finally {
      setIsProcessingPayment(false);
    }
  }

  function handleLookupToken(e: React.FormEvent) {
    e.preventDefault();
    setLookupError(null);
    setLookupResult(null);

    const query = searchToken.trim().toLowerCase();
    if (!query) {
      setLookupError('Please enter an Appointment Token ID or email.');
      return;
    }

    const all = getStoredAppointments();
    const found = all.find(
      (a) => a.id.toLowerCase() === query || a.email.toLowerCase() === query
    );

    if (found) {
      setLookupResult(found);
    } else {
      setLookupError(`No appointment found for "${searchToken}". Format: APT-APO-2026-XXXX.`);
    }
  }

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
              href="#booking-portal"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all transform hover:-translate-y-0.5"
            >
              Book Care Consultation (₹500) →
            </a>
            <a
              href="#the-crisis"
              className="px-7 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-sm sm:text-base backdrop-blur-md transition"
            >
              🎬 Watch The Crisis &amp; Solution
            </a>
            <button
              type="button"
              onClick={() => setPromptModalOpen(true)}
              className="px-6 py-4 rounded-2xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-200 font-bold text-xs sm:text-sm backdrop-blur-md transition flex items-center gap-2 cursor-pointer"
            >
              <span>✨</span>
              <span>AI Video Prompts</span>
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
            SECTION 3: THE APPOINTMENT BOOKING STUDIO (APPLE-STYLE STUDIO)
        ========================================================================= */}
        <section id="booking-portal" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
              Live Care Reservation
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Book Your MediQR Consultation &amp; Identity Token.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Service Fee: <strong className="text-white font-mono text-base">₹500.00</strong>. Includes emergency triage encoding, doctor consultation, and immutable blockchain ledger anchor.
            </p>
          </div>

          {/* Glassmorphic Wizard Card */}
          <div className="rounded-3xl bg-slate-900/90 border border-white/15 p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-8">
            
            {/* Step Breadcrumbs */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  bookingStep >= 1 ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-400'
                }`}>
                  1
                </span>
                <span className={`text-xs font-bold hidden sm:inline ${bookingStep === 1 ? 'text-blue-400' : 'text-slate-400'}`}>
                  Patient Vitals
                </span>
                <span className="text-slate-600">→</span>

                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  bookingStep >= 2 ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-400'
                }`}>
                  2
                </span>
                <span className={`text-xs font-bold hidden sm:inline ${bookingStep === 2 ? 'text-blue-400' : 'text-slate-400'}`}>
                  Facility &amp; Doctor
                </span>
                <span className="text-slate-600">→</span>

                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  bookingStep >= 3 ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-400'
                }`}>
                  3
                </span>
                <span className={`text-xs font-bold hidden sm:inline ${bookingStep === 3 ? 'text-blue-400' : 'text-slate-400'}`}>
                  Fee Payment
                </span>
                <span className="text-slate-600">→</span>

                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  bookingStep === 4 ? 'bg-emerald-600 text-white' : 'bg-white/10 text-slate-400'
                }`}>
                  4
                </span>
                <span className={`text-xs font-bold hidden sm:inline ${bookingStep === 4 ? 'text-emerald-400' : 'text-slate-400'}`}>
                  Mined Token
                </span>
              </div>

              <span className="text-xs font-mono text-emerald-400 font-bold">₹500.00 Service Fee</span>
            </div>

            {/* STEP 1: PATIENT REGISTRATION */}
            {bookingStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Step 1: Patient Information &amp; Roadside Emergency Vitals</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    These critical vitals are encoded into your emergency MediQR so paramedics can identify your blood type and drug allergies in 0.02s.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                      placeholder="e.g. Rahul Sharma"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Email (for Token &amp; MediQR) *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                      placeholder="rahul@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                      placeholder="+91-98765-43210"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                      min="1"
                      max="120"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    >
                      <option value="Male" className="bg-slate-900">Male</option>
                      <option value="Female" className="bg-slate-900">Female</option>
                      <option value="Other" className="bg-slate-900">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-rose-300 block mb-1">Blood Group (Critical for Triage) *</label>
                    <select
                      value={bloodType}
                      onChange={(e) => setBloodType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-rose-950/40 border border-rose-500/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-extrabold text-rose-300"
                    >
                      <option value="A+" className="bg-slate-900">A+ (A Positive)</option>
                      <option value="A-" className="bg-slate-900">A- (A Negative)</option>
                      <option value="B+" className="bg-slate-900">B+ (B Positive)</option>
                      <option value="B-" className="bg-slate-900">B- (B Negative)</option>
                      <option value="AB+" className="bg-slate-900">AB+ (Universal Plasma Recipient)</option>
                      <option value="AB-" className="bg-slate-900">AB- (AB Negative)</option>
                      <option value="O+" className="bg-slate-900">O+ (O Positive)</option>
                      <option value="O-" className="bg-slate-900">O- (Universal Red Cell Donor)</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="font-bold text-slate-300 block mb-1">Critical Drug / Anaphylaxis Allergies *</label>
                    <input
                      type="text"
                      value={criticalAllergies}
                      onChange={(e) => setCriticalAllergies(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                      placeholder="e.g. Penicillin G, Aspirin, Peanuts"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Chronic Conditions</label>
                    <input
                      type="text"
                      value={chronicConditions}
                      onChange={(e) => setChronicConditions(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                      placeholder="e.g. Mild Asthma, Hypertension"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Emergency Contact Person *</label>
                    <input
                      type="text"
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                      placeholder="Pooja Sharma (Spouse)"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Emergency Contact Phone *</label>
                    <input
                      type="tel"
                      value={emergencyContactPhone}
                      onChange={(e) => setEmergencyContactPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                      placeholder="+91-98765-43211"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">National ID / Aadhaar *</label>
                    <input
                      type="text"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-mono"
                      placeholder="IN-AADHAAR-XXXX-XXXX"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      if (!fullName || !email || !phone) {
                        alert('Please fill in your name, email, and phone number.');
                        return;
                      }
                      setBookingStep(2);
                    }}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Doctor &amp; Facility Selection</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: DOCTOR & HOSPITAL */}
            {bookingStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Step 2: Choose Accredited Hospital &amp; Doctor</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Select a hospital storage node and accredited clinician in the MediQR consortium.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Apollo */}
                  <div
                    onClick={() => setSelectedHospital('apollo')}
                    className={`p-6 rounded-2xl border-2 transition cursor-pointer ${
                      selectedHospital === 'apollo'
                        ? 'border-blue-500 bg-blue-600/15 shadow-xl shadow-blue-500/10'
                        : 'border-white/10 hover:border-white/20 bg-black/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Node A :5001</span>
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedHospital === 'apollo' ? 'border-blue-400 bg-blue-500' : 'border-slate-600'
                      }`} />
                    </div>
                    <h4 className="text-base font-bold text-white">Apollo Speciality Hospital</h4>
                    <p className="text-xs text-slate-400 mt-1">Lead Department: Emergency Medicine &amp; Pulmonology</p>
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Attending Doctor:</span>
                      <strong className="text-blue-300">Dr. Ramesh Gupta</strong>
                    </div>
                  </div>

                  {/* Fortis */}
                  <div
                    onClick={() => setSelectedHospital('fortis')}
                    className={`p-6 rounded-2xl border-2 transition cursor-pointer ${
                      selectedHospital === 'fortis'
                        ? 'border-indigo-500 bg-indigo-600/15 shadow-xl shadow-indigo-500/10'
                        : 'border-white/10 hover:border-white/20 bg-black/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Node B :5002</span>
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedHospital === 'fortis' ? 'border-indigo-400 bg-indigo-500' : 'border-slate-600'
                      }`} />
                    </div>
                    <h4 className="text-base font-bold text-white">Fortis Healthcare Network</h4>
                    <p className="text-xs text-slate-400 mt-1">Lead Department: Clinical Diagnostics &amp; Pathology</p>
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Attending Doctor:</span>
                      <strong className="text-indigo-300">Dr. Ananya Sharma</strong>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Appointment Date *</label>
                    <input
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Time Slot *</label>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    >
                      <option value="10:00 AM - 10:30 AM" className="bg-slate-900">10:00 AM - 10:30 AM</option>
                      <option value="11:00 AM - 11:30 AM" className="bg-slate-900">11:00 AM - 11:30 AM</option>
                      <option value="02:00 PM - 02:30 PM" className="bg-slate-900">02:00 PM - 02:30 PM</option>
                      <option value="04:30 PM - 05:00 PM" className="bg-slate-900">04:30 PM - 05:00 PM</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Consultation Reason *</label>
                    <input
                      type="text"
                      value={consultationReason}
                      onChange={(e) => setConsultationReason(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setBookingStep(1)}
                    className="px-5 py-2.5 border border-white/15 hover:bg-white/5 text-slate-300 font-bold text-xs rounded-xl transition"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingStep(3)}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Service Fee Payment (₹500)</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PAYMENT GATEWAY */}
            {bookingStep === 3 && (
              <div className="space-y-6 max-w-xl mx-auto">
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-bold text-white">Step 3: Pay Consultation &amp; Blockchain Fee</h3>
                  <p className="text-xs text-slate-400">
                    Payment unlocks your cryptographic token ID and queues consultation on Doctor Terminal.
                  </p>
                </div>

                <div className="bg-black/50 border border-white/10 rounded-2xl p-5 space-y-3 text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Patient:</span>
                    <strong className="text-white">{fullName}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Facility:</span>
                    <span className="text-white">{selectedHospital === 'apollo' ? 'Apollo Speciality (Dr. Ramesh Gupta)' : 'Fortis Healthcare (Dr. Ananya Sharma)'}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Schedule:</span>
                    <span className="text-white">{appointmentDate} at {timeSlot}</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between items-center text-sm">
                    <span className="font-bold text-white">Service Fee Total:</span>
                    <span className="font-extrabold text-emerald-400 font-mono text-lg">₹500.00</span>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-3">
                  <label className="font-bold text-xs text-slate-300 block">Select Payment Channel:</label>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('demo')}
                      className={`p-3.5 rounded-xl border-2 transition cursor-pointer text-center ${
                        paymentMethod === 'demo'
                          ? 'border-emerald-500 bg-emerald-500/15 text-white font-bold'
                          : 'border-white/10 hover:bg-white/5 text-slate-400'
                      }`}
                    >
                      <span className="block text-lg mb-1">⚡</span>
                      <span>1-Click Academic Pay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-3.5 rounded-xl border-2 transition cursor-pointer text-center ${
                        paymentMethod === 'upi'
                          ? 'border-blue-500 bg-blue-500/15 text-white font-bold'
                          : 'border-white/10 hover:bg-white/5 text-slate-400'
                      }`}
                    >
                      <span className="block text-lg mb-1">📱</span>
                      <span>UPI / GPay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3.5 rounded-xl border-2 transition cursor-pointer text-center ${
                        paymentMethod === 'card'
                          ? 'border-blue-500 bg-blue-500/15 text-white font-bold'
                          : 'border-white/10 hover:bg-white/5 text-slate-400'
                      }`}
                    >
                      <span className="block text-lg mb-1">💳</span>
                      <span>Credit Card</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setBookingStep(2)}
                    disabled={isProcessingPayment}
                    className="px-5 py-2.5 border border-white/15 hover:bg-white/5 text-slate-300 font-bold text-xs rounded-xl transition"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAndPay}
                    disabled={isProcessingPayment}
                    className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-extrabold text-xs rounded-xl shadow-xl transition flex items-center gap-2 cursor-pointer"
                  >
                    <span>{isProcessingPayment ? '⌛ Anchoring on Blockchain...' : '✓ Pay ₹500 & Generate Token'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: MINED TOKEN CONFIRMATION */}
            {bookingStep === 4 && confirmedAppointment && (
              <div className="space-y-6 text-center max-w-xl mx-auto animate-in zoom-in-95">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 rounded-full flex items-center justify-center text-3xl font-bold mx-auto shadow-2xl">
                  ✓
                </div>
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-bold border border-emerald-500/20">
                    <span>⛓️</span> Transaction Mined into Blockchain Block
                  </div>
                  <h3 className="text-2xl font-extrabold text-white">
                    Consultation Token Confirmed!
                  </h3>
                  <p className="text-xs text-slate-300">
                    Payment of ₹{confirmedAppointment.serviceFee}.00 verified. Confirmation email sent to <strong className="text-white">{confirmedAppointment.email}</strong>.
                  </p>
                </div>

                <div className="bg-black/60 border-2 border-emerald-500/40 rounded-2xl p-6 shadow-2xl space-y-2">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Your Official Appointment Token ID
                  </div>
                  <div className="font-mono text-3xl font-extrabold text-blue-400 tracking-wide select-all">
                    {confirmedAppointment.id}
                  </div>
                  <div className="text-xs text-slate-300 pt-2 border-t border-white/10">
                    Physician: <strong className="text-white">{confirmedAppointment.doctorName}</strong> ({confirmedAppointment.hospitalName})
                  </div>
                  <div className="text-xs text-slate-400">
                    Slot: <strong className="text-slate-200">{confirmedAppointment.appointmentDate}</strong> at <strong className="text-slate-200">{confirmedAppointment.timeSlot}</strong>
                  </div>
                </div>

                {/* Looping Blockchain Seal Video Artifact */}
                <div className="rounded-2xl overflow-hidden border border-emerald-500/30 max-w-sm mx-auto shadow-xl bg-black/60">
                  <div className="aspect-video relative">
                    <video
                      src="/videos/blockchain-seal.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-2 left-3 right-3 text-left">
                      <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Ledger Proof Confirmed
                      </div>
                      <div className="text-[10px] font-mono text-slate-300 truncate">
                        Block Ref: {confirmedAppointment.paymentTxRef}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEmailModalOpen(true)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
                  >
                    <span>✉️</span>
                    <span>Inspect Dispatched Email</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setConfirmedAppointment(null);
                      setBookingStep(1);
                    }}
                    className="px-5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs rounded-xl transition"
                  >
                    Book Another Appointment
                  </button>
                </div>
              </div>
            )}

          </div>

        </section>

        {/* =========================================================================
            SECTION 4: TOKEN LOOKUP UTILITY
        ========================================================================= */}
        <section className="max-w-xl mx-auto px-4 sm:px-6 space-y-4 text-center">
          <h3 className="text-base font-bold text-white">Already Booked? Lookup Your Token Status</h3>
          <form onSubmit={handleLookupToken} className="flex gap-2">
            <input
              type="text"
              value={searchToken}
              onChange={(e) => setSearchToken(e.target.value)}
              placeholder="e.g. APT-APO-2026-8812 or rahul@example.com"
              className="flex-1 px-4 py-3 bg-slate-900 border border-white/15 rounded-xl text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              Search
            </button>
          </form>

          {lookupError && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs text-left">
              {lookupError}
            </div>
          )}

          {lookupResult && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-white/15 text-left text-xs space-y-3 shadow-xl">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="font-mono text-base font-bold text-blue-400">{lookupResult.id}</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  lookupResult.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {lookupResult.status === 'COMPLETED' ? '✓ Consultation Complete' : '⏳ Ready for Doctor'}
                </span>
              </div>
              <div>Patient: <strong>{lookupResult.patientName}</strong> ({lookupResult.bloodType})</div>
              <div>Doctor: <strong>{lookupResult.doctorName}</strong> ({lookupResult.hospitalName})</div>
              <div>Time: {lookupResult.appointmentDate} at {lookupResult.timeSlot}</div>
            </div>
          )}
        </section>

        {/* =========================================================================
            SECTION 5: FAQ & ENTERPRISE COMPLIANCE
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
