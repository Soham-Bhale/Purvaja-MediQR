'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  saveAppointment,
  getStoredAppointments,
  Appointment,
} from '../../lib/appointments';
import { mineNewBlock } from '../../lib/blockchain-blocks';
import { sendAppointmentConfirmationEmail } from '../../lib/email-service';
import EmailInboxModal from '../../components/EmailInboxModal';

export default function AppointmentBookingPage() {
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
  const [emailModalOpen, setEmailModalOpen] = useState(false);

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
        .slice(0, 64)}`;

      const doctorName =
        selectedHospital === 'apollo'
          ? 'Dr. Rajesh Mehta (Cardiology)'
          : 'Dr. Ananya Sharma (Trauma & Critical Care)';

      const hospitalName =
        selectedHospital === 'apollo'
          ? 'Apollo Hospitals Network (Node A)'
          : 'Fortis Healthcare (Node B)';

      const hospitalNodeUrl =
        selectedHospital === 'apollo' ? 'http://localhost:5001' : 'http://localhost:5002';

      const allergiesArray = criticalAllergies
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const conditionsArray = chronicConditions
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const newApt = saveAppointment({
        id: tokenId,
        patientId,
        patientName: fullName,
        email,
        phone,
        age: Number(age) || 30,
        gender,
        bloodType,
        criticalAllergies: allergiesArray,
        chronicConditions: conditionsArray,
        emergencyContactName,
        emergencyContactPhone,
        nationalId,
        patientHash,
        hospitalId: selectedHospital,
        hospitalName,
        hospitalNodeUrl,
        doctorId: selectedDoctor,
        doctorName,
        department: selectedHospital === 'apollo' ? 'Cardiology' : 'Trauma Care',
        appointmentDate,
        timeSlot,
        consultationReason,
        serviceFee,
        paymentStatus: 'PAID',
        paymentMethod: paymentMethod === 'demo' ? '1-Click Instant Demo Pay' : paymentMethod.toUpperCase(),
        paymentTxRef: txRef,
        status: 'PENDING_EXAMINATION',
        bookedAt: Date.now(),
      });

      await mineNewBlock([
        {
          txId: txRef,
          type: 'APPOINTMENT_PAYMENT_CONFIRMED',
          timestamp: Date.now(),
          patientHash,
          patientName: fullName,
          details: `Service Fee ₹${serviceFee} Settled · Token ${tokenId} Assigned to ${doctorName} · Hospital ${hospitalName}`,
          amount: `₹${serviceFee}.00`,
          doctor: doctorName,
          hospitalNode: hospitalName,
          status: 'MINED',
        },
      ]);

      sendAppointmentConfirmationEmail(newApt);

      setConfirmedAppointment(newApt);
      setBookingStep(4);
    } finally {
      setIsProcessingPayment(false);
    }
  }

  function handleLookupToken(e: React.FormEvent) {
    e.preventDefault();
    setLookupError(null);
    setLookupResult(null);

    const token = searchToken.trim();
    if (!token) return;

    const all = getStoredAppointments();
    const found = all.find((a) => a.id.toLowerCase() === token.toLowerCase());
    if (found) {
      setLookupResult(found);
    } else {
      setLookupError(`Token ID "${token}" not found. Verify your confirmation email or book a new appointment.`);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <Link
            href="/"
            className="text-xs font-mono font-medium text-slate-400 hover:text-white transition flex items-center gap-1.5"
          >
            ← Return to Home
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEmailModalOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-center gap-1.5"
            >
              <span>✉️</span>
              <span>Dispatched Emails</span>
            </button>
          </div>
        </div>

        {/* Page Header */}
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Official Consultation &amp; Triage Token Booking
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Book MediQR Doctor Consultation
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Fixed Service Fee: <strong className="text-white font-mono text-base">₹500.00</strong>. Includes doctor examination, optical triage card encoding, and immutable Ethereum blockchain anchor.
          </p>
        </div>

        {/* Multistep Booking Studio */}
        <div className="rounded-3xl bg-slate-900/90 border border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          
          {/* Stepper Wizard Bar */}
          <div className="flex items-center justify-between pb-8 mb-8 border-b border-white/10 font-mono text-xs">
            <div className={`flex items-center gap-2 ${bookingStep >= 1 ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${bookingStep >= 1 ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>1</span>
              <span className="hidden sm:inline">Patient Vitals</span>
            </div>
            <span className="text-slate-700">→</span>
            <div className={`flex items-center gap-2 ${bookingStep >= 2 ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${bookingStep >= 2 ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>2</span>
              <span className="hidden sm:inline">Facility &amp; Doctor</span>
            </div>
            <span className="text-slate-700">→</span>
            <div className={`flex items-center gap-2 ${bookingStep >= 3 ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${bookingStep >= 3 ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>3</span>
              <span className="hidden sm:inline">Fee Payment</span>
            </div>
            <span className="text-slate-700">→</span>
            <div className={`flex items-center gap-2 ${bookingStep >= 4 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${bookingStep >= 4 ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>4</span>
              <span className="hidden sm:inline">Mined Token</span>
            </div>
          </div>

          {/* STEP 1: PATIENT VITALS & IDENTIFICATION */}
          {bookingStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Step 1: Patient Information &amp; Roadside Emergency Vitals</h3>
                <p className="text-xs text-slate-400">These vitals are encoded into your emergency MediQR so paramedics can identify your blood type and drug allergies in 0.02s.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-300">Full Legal Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-300">Email (for Token &amp; MediQR) *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-300">Phone Number *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-300">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-300">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-rose-300 font-bold">Blood Group (Critical for Triage) *</label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full bg-rose-950/30 border border-rose-500/40 rounded-xl px-3.5 py-2.5 text-xs text-rose-200 font-bold focus:outline-none focus:border-rose-400"
                  >
                    <option value="A+">A+ (Rh Positive)</option>
                    <option value="A-">A- (Rh Negative)</option>
                    <option value="B+">B+ (Rh Positive)</option>
                    <option value="B-">B- (Rh Negative)</option>
                    <option value="AB+">AB+ (Rh Positive)</option>
                    <option value="AB-">AB- (Rh Negative)</option>
                    <option value="O+">O+ (Rh Positive)</option>
                    <option value="O-">O- (Rh Negative)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-300">Critical Drug / Anaphylaxis Allergies *</label>
                  <input
                    type="text"
                    value={criticalAllergies}
                    onChange={(e) => setCriticalAllergies(e.target.value)}
                    placeholder="e.g. Penicillin, Aspirin, Sulfa drugs"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-300">Chronic Conditions</label>
                  <input
                    type="text"
                    value={chronicConditions}
                    onChange={(e) => setChronicConditions(e.target.value)}
                    placeholder="e.g. Asthma, Type 2 Diabetes, Hypertension"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-300">ICE Emergency Contact Name &amp; Relation *</label>
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="e.g. Pooja Sharma (Spouse)"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-300">ICE Emergency Contact Phone *</label>
                  <input
                    type="text"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    placeholder="+91-98765-43211"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setBookingStep(2)}
                  className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-cyan-600/30"
                >
                  Proceed to Doctor &amp; Schedule →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: HOSPITAL, DOCTOR & TIME SLOT */}
          {bookingStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Step 2: Select Hospital Vault &amp; Certified Physician</h3>
                <p className="text-xs text-slate-400">Choose the attending hospital node where your encrypted clinical records will be housed.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setSelectedHospital('apollo')}
                  className={`p-5 rounded-2xl border cursor-pointer transition ${
                    selectedHospital === 'apollo'
                      ? 'bg-cyan-500/15 border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="text-xs font-mono font-bold text-cyan-400">HOSPITAL STORAGE NODE A</div>
                  <div className="text-base font-bold text-white mt-1">Apollo Hospitals Network</div>
                  <p className="text-xs text-slate-300 mt-1">Specialty: Cardiology &amp; Internal Medicine</p>
                  <div className="text-[11px] font-mono text-slate-400 mt-2">Storage Node: http://localhost:5001</div>
                </div>

                <div
                  onClick={() => setSelectedHospital('fortis')}
                  className={`p-5 rounded-2xl border cursor-pointer transition ${
                    selectedHospital === 'fortis'
                      ? 'bg-blue-500/15 border-blue-400 shadow-md shadow-blue-500/20'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="text-xs font-mono font-bold text-blue-400">HOSPITAL STORAGE NODE B</div>
                  <div className="text-base font-bold text-white mt-1">Fortis Healthcare Network</div>
                  <p className="text-xs text-slate-300 mt-1">Specialty: Trauma, Pulmonology &amp; Critical Care</p>
                  <div className="text-[11px] font-mono text-slate-400 mt-2">Storage Node: http://localhost:5002</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-300">Appointment Date *</label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-300">Time Slot *</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="09:30 AM - 10:00 AM">09:30 AM - 10:00 AM</option>
                    <option value="11:00 AM - 11:30 AM">11:00 AM - 11:30 AM</option>
                    <option value="02:00 PM - 02:30 PM">02:00 PM - 02:30 PM</option>
                    <option value="04:30 PM - 05:00 PM">04:30 PM - 05:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-slate-300">Consultation Reason / Clinical Symptoms</label>
                <textarea
                  rows={2}
                  value={consultationReason}
                  onChange={(e) => setConsultationReason(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
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
                  className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-cyan-600/30"
                >
                  Proceed to Fee Payment (₹500) →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: FEE PAYMENT & BLOCKCHAIN ANCHOR */}
          {bookingStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Step 3: Pay Consultation &amp; Blockchain Anchoring Fee</h3>
                <p className="text-xs text-slate-400">Settles the healthcare service fee and commits the appointment transaction to the Ethereum consortium block.</p>
              </div>

              <div className="p-5 rounded-2xl bg-black/40 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">Patient:</span>
                  <span className="text-white font-bold">{fullName} ({bloodType})</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">Hospital &amp; Node:</span>
                  <span className="text-white font-bold">{selectedHospital === 'apollo' ? 'Apollo Hospitals (:5001)' : 'Fortis Healthcare (:5002)'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">Schedule:</span>
                  <span className="text-white font-bold">{appointmentDate} at {timeSlot}</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Total Service Fee</span>
                  <span className="text-2xl font-mono font-extrabold text-cyan-400">₹{serviceFee}.00</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-mono text-slate-300">Select Demo Payment Method</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('demo')}
                    className={`p-3 rounded-xl border text-xs font-mono font-bold transition ${paymentMethod === 'demo' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-black/40 border-white/10 text-slate-400'}`}
                  >
                    1-Click Instant Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 rounded-xl border text-xs font-mono font-bold transition ${paymentMethod === 'upi' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-black/40 border-white/10 text-slate-400'}`}
                  >
                    UPI / QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-xs font-mono font-bold transition ${paymentMethod === 'card' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-black/40 border-white/10 text-slate-400'}`}
                  >
                    Credit / Debit Card
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
                  className="px-8 py-3.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xl shadow-cyan-600/30 transition flex items-center gap-2 cursor-pointer"
                >
                  <span>{isProcessingPayment ? '⌛ Anchoring on Blockchain...' : '✓ Pay ₹500 & Generate Token'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: MINED TOKEN CONFIRMATION */}
          {bookingStep === 4 && confirmedAppointment && (
            <div className="space-y-6 text-center max-w-xl mx-auto">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 rounded-full flex items-center justify-center text-3xl font-bold mx-auto shadow-2xl">
                ✓
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/20">
                  <span>⛓️</span> Transaction Mined into Blockchain Block
                </div>
                <h3 className="text-2xl font-extrabold text-white">
                  Consultation Token Confirmed!
                </h3>
                <p className="text-xs text-slate-300">
                  Payment of ₹{confirmedAppointment.serviceFee}.00 verified. Confirmation notification sent to <strong className="text-white">{confirmedAppointment.email}</strong>.
                </p>
              </div>

              <div className="bg-black/60 border-2 border-emerald-500/40 rounded-2xl p-6 shadow-2xl space-y-2">
                <div className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest">
                  Your Official Appointment Token ID
                </div>
                <div className="font-mono text-3xl font-extrabold text-cyan-400 tracking-wide select-all">
                  {confirmedAppointment.id}
                </div>
                <div className="text-xs text-slate-300 pt-2 border-t border-white/10">
                  Physician: <strong className="text-white">{confirmedAppointment.doctorName}</strong> ({confirmedAppointment.hospitalName})
                </div>
                <div className="text-xs text-slate-400">
                  Slot: <strong className="text-slate-200">{confirmedAppointment.appointmentDate}</strong> at <strong className="text-slate-200">{confirmedAppointment.timeSlot}</strong>
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

        {/* Token Lookup Utility */}
        <div className="max-w-xl mx-auto text-center space-y-4 pt-6">
          <h3 className="text-sm font-bold text-white">Already Booked? Lookup Your Token Status</h3>
          <form onSubmit={handleLookupToken} className="flex gap-2">
            <input
              type="text"
              value={searchToken}
              onChange={(e) => setSearchToken(e.target.value)}
              placeholder="e.g. APT-APO-2026-9041"
              className="flex-1 bg-black/40 border border-white/15 rounded-xl px-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="px-5 py-2 bg-slate-800 hover:bg-slate-700 border border-white/20 text-white text-xs font-bold rounded-xl transition"
            >
              Verify Token
            </button>
          </form>

          {lookupResult && (
            <div className="p-4 rounded-xl bg-black/60 border border-emerald-500/40 text-left text-xs space-y-1 font-mono">
              <div className="text-emerald-400 font-bold">✓ Token Active on Blockchain</div>
              <div>Patient: <strong className="text-white">{lookupResult.patientName}</strong></div>
              <div>Doctor: {lookupResult.doctorName} ({lookupResult.hospitalName})</div>
              <div>Date: {lookupResult.appointmentDate} ({lookupResult.timeSlot})</div>
              <div>Status: <span className="text-cyan-400 font-bold">{lookupResult.status}</span></div>
            </div>
          )}

          {lookupError && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono">
              {lookupError}
            </div>
          )}
        </div>

      </div>

      <EmailInboxModal isOpen={emailModalOpen} onClose={() => setEmailModalOpen(false)} />
    </div>
  );
}
