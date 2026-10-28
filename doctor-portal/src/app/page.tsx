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
import EmailInboxModal from '../components/EmailInboxModal';

export default function PatientPortalHomePage() {
  const [activeTab, setActiveTab] = useState<'book' | 'lookup' | 'architecture'>('book');
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
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'demo'>('demo');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  // Lookup Token State
  const [searchToken, setSearchToken] = useState('');
  const [lookupResult, setLookupResult] = useState<Appointment | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Email Modal State
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  // Pre-fill doctor details based on hospital selection
  useEffect(() => {
    if (selectedHospital === 'apollo') {
      setSelectedDoctor('0x70997970c51812dc3a010c7d01b50e0d17dc79c8'); // Dr. Ramesh Gupta
    } else {
      setSelectedDoctor('0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc'); // Dr. Ananya Sharma
    }
  }, [selectedHospital]);

  async function handleConfirmAndPay() {
    setIsProcessingPayment(true);
    try {
      // Simulate realistic payment delay
      await new Promise((res) => setTimeout(res, 1200));

      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const hospitalPrefix = selectedHospital === 'apollo' ? 'APO' : 'FOR';
      const tokenId = `APT-${hospitalPrefix}-2026-${randomSuffix}`;
      const patientId = `PAT-${fullName.replace(/\s+/g, '-').toUpperCase()}-${randomSuffix}`;
      const txRef = `TXN-PAY-${Date.now().toString(36).toUpperCase()}`;

      // Deterministic patient hash
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
        paymentMethod: paymentMethod === 'upi' ? 'UPI / GPay' : paymentMethod === 'card' ? 'Credit Card (Visa)' : 'MediQR Instant Pay',
        paymentTxRef: txRef,
        status: 'PENDING_EXAMINATION',
        bookedAt: Date.now(),
      };

      // 1. Save to appointments registry
      saveAppointment(newAppointment);

      // 2. Mine a transaction on the Live Blockchain Explorer!
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

      // 3. Dispatch official email notification
      sendAppointmentConfirmationEmail(newAppointment);

      setConfirmedAppointment(newAppointment);
      setBookingStep(4); // Move to confirmation screen
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
      setLookupError(`No appointment found for "${searchToken}". Verify the token format (e.g. APT-APO-2026-8812).`);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner (Laptop 1: Patient-Facing) */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold mb-2.5 border border-white/20">
            <span>💻</span> Laptop 1: Patient Registration &amp; Appointment Interface
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            MediQR Healthcare Service &amp; Paid Appointment Booking
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1.5 max-w-2xl leading-relaxed">
            Register for QR-based emergency healthcare, schedule consultations with accredited consortium physicians, and receive cryptographic appointment tokens anchored on the blockchain.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setEmailModalOpen(true)}
            className="px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/30 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <span>✉️</span>
            <span>View Sent Emails</span>
          </button>
          <Link
            href="/doctor"
            className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
          >
            <span>🩺 Doctor Portal →</span>
          </Link>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('book')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'book'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🎟️</span>
          <span>Book Paid Appointment</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('lookup')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'lookup'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🔍</span>
          <span>Lookup My Token &amp; Records</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('architecture')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'architecture'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🌐</span>
          <span>3-Device Live Demo Blueprint</span>
        </button>
      </div>

      {/* TAB 1: BOOKING WIZARD */}
      {activeTab === 'book' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Step Breadcrumb Indicators */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                bookingStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                1
              </span>
              <span className={`text-xs font-bold hidden sm:inline ${bookingStep === 1 ? 'text-blue-600' : 'text-slate-700'}`}>
                Patient Vitals
              </span>
              <span className="text-slate-300">→</span>

              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                bookingStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                2
              </span>
              <span className={`text-xs font-bold hidden sm:inline ${bookingStep === 2 ? 'text-blue-600' : 'text-slate-700'}`}>
                Hospital &amp; Doctor
              </span>
              <span className="text-slate-300">→</span>

              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                bookingStep >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                3
              </span>
              <span className={`text-xs font-bold hidden sm:inline ${bookingStep === 3 ? 'text-blue-600' : 'text-slate-700'}`}>
                Fee &amp; Payment
              </span>
              <span className="text-slate-300">→</span>

              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                bookingStep === 4 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                4
              </span>
              <span className={`text-xs font-bold hidden sm:inline ${bookingStep === 4 ? 'text-emerald-600' : 'text-slate-700'}`}>
                Confirmed Token
              </span>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Consultation Fee: <strong className="text-slate-900 font-mono">₹500.00</strong>
            </div>
          </div>

          {/* STEP 1: PATIENT REGISTRATION & EMERGENCY VITALS */}
          {bookingStep === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Step 1: Patient Registration &amp; Emergency Vitals</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  These details form your emergency roadside profile and are encoded into your post-consultation MediQR card.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Rahul Sharma"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address (for Tokens &amp; QR) *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. rahul@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+91-98765-43210"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="120"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Blood Group (Critical for Triage) *</label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full px-3 py-2 border border-rose-300 bg-rose-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold text-rose-900"
                  >
                    <option value="A+">A+ (A Positive)</option>
                    <option value="A-">A- (A Negative)</option>
                    <option value="B+">B+ (B Positive)</option>
                    <option value="B-">B- (B Negative)</option>
                    <option value="AB+">AB+ (Universal Plasma Recipient)</option>
                    <option value="AB-">AB- (AB Negative)</option>
                    <option value="O+">O+ (O Positive)</option>
                    <option value="O-">O- (Universal Red Cell Donor)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    Critical Drug / Food Allergies (Separated by commas) *
                  </label>
                  <input
                    type="text"
                    value={criticalAllergies}
                    onChange={(e) => setCriticalAllergies(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Penicillin G, Aspirin, Peanuts"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Chronic Conditions</label>
                  <input
                    type="text"
                    value={chronicConditions}
                    onChange={(e) => setChronicConditions(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Asthma, Hypertension, Diabetes"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Emergency Contact Person *</label>
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Pooja Sharma (Spouse)"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Emergency Contact Phone *</label>
                  <input
                    type="tel"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+91-98765-43211"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">National ID / Aadhaar *</label>
                  <input
                    type="text"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-[11px]"
                    placeholder="IN-AADHAAR-XXXX-XXXX-XXXX"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    if (!fullName || !email || !phone) {
                      alert('Please fill in your name, email, and phone number.');
                      return;
                    }
                    setBookingStep(2);
                  }}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Continue to Hospital &amp; Doctor Selection</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: HOSPITAL & DOCTOR SELECTION */}
          {bookingStep === 2 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Step 2: Choose Hospital Facility &amp; Doctor</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select an accredited hospital node in the MediQR consortium network.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Hospital A Card */}
                <div
                  onClick={() => setSelectedHospital('apollo')}
                  className={`p-5 rounded-2xl border-2 transition cursor-pointer ${
                    selectedHospital === 'apollo'
                      ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                      Hospital Node A
                    </span>
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedHospital === 'apollo' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                    }`}>
                      {selectedHospital === 'apollo' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Apollo Speciality Hospital</h3>
                  <p className="text-xs text-slate-500 mt-1">Lead Node: Emergency Medicine, Pulmonology, and Critical Care</p>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Attending Doctor:</span>
                    <strong className="text-blue-900">Dr. Ramesh Gupta</strong>
                  </div>
                </div>

                {/* Hospital B Card */}
                <div
                  onClick={() => setSelectedHospital('fortis')}
                  className={`p-5 rounded-2xl border-2 transition cursor-pointer ${
                    selectedHospital === 'fortis'
                      ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                      Hospital Node B
                    </span>
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedHospital === 'fortis' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                    }`}>
                      {selectedHospital === 'fortis' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Fortis Healthcare Network</h3>
                  <p className="text-xs text-slate-500 mt-1">Lead Node: Clinical Diagnostics, Pathology, and Cardiology</p>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Attending Doctor:</span>
                    <strong className="text-indigo-900">Dr. Ananya Sharma</strong>
                  </div>
                </div>
              </div>

              {/* Appointment Date & Slot */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Appointment Date *</label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Time Slot *</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM (Available)</option>
                    <option value="11:00 AM - 11:30 AM">11:00 AM - 11:30 AM (Available)</option>
                    <option value="02:00 PM - 02:30 PM">02:00 PM - 02:30 PM (Available)</option>
                    <option value="04:30 PM - 05:00 PM">04:30 PM - 05:00 PM (Available)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Reason for Consultation *</label>
                  <input
                    type="text"
                    value={consultationReason}
                    onChange={(e) => setConsultationReason(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Asthma checkup, General screening"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBookingStep(1)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl transition"
                >
                  ← Back to Vitals
                </button>
                <button
                  type="button"
                  onClick={() => setBookingStep(3)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Proceed to Service Fee Payment (₹500)</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT GATEWAY */}
          {bookingStep === 3 && (
            <div className="space-y-6 animate-in fade-in max-w-xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl font-bold mx-auto mb-2">
                  💳
                </div>
                <h2 className="text-lg font-bold text-slate-900">Step 3: Pay Consultation &amp; Blockchain Ledger Fee</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Secure cryptographic token assignment through the MediQR payment gateway.
                </p>
              </div>

              {/* Order Summary Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Patient Name:</span>
                  <strong className="text-slate-900">{fullName}</strong>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Facility &amp; Doctor:</span>
                  <span className="text-slate-900">
                    {selectedHospital === 'apollo' ? 'Apollo (Dr. Ramesh Gupta)' : 'Fortis (Dr. Ananya Sharma)'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Slot &amp; Date:</span>
                  <span className="text-slate-900">{appointmentDate} at {timeSlot}</span>
                </div>
                <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-900">Total Service Fee:</span>
                  <span className="font-extrabold text-emerald-700 font-mono text-base">₹500.00</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <label className="font-bold text-xs text-slate-700 block">Select Payment Method:</label>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('demo')}
                    className={`p-3 rounded-xl border-2 text-center transition cursor-pointer ${
                      paymentMethod === 'demo'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="block text-base mb-1">⚡</span>
                    <span>1-Click Academic Pay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 rounded-xl border-2 text-center transition cursor-pointer ${
                      paymentMethod === 'upi'
                        ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="block text-base mb-1">📱</span>
                    <span>UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border-2 text-center transition cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="block text-base mb-1">💳</span>
                    <span>Credit / Debit Card</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBookingStep(2)}
                  disabled={isProcessingPayment}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl transition"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAndPay}
                  disabled={isProcessingPayment}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <span>{isProcessingPayment ? '⌛ Securing on Blockchain...' : '✓ Pay ₹500 & Generate Token'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CONFIRMATION & TOKEN DISPLAY */}
          {bookingStep === 4 && confirmedAppointment && (
            <div className="space-y-6 animate-in zoom-in-95 max-w-2xl mx-auto">
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 sm:p-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto shadow-md">
                  ✓
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  <span>⛓️</span> Mined on Consortium Blockchain
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-950">
                  Appointment Confirmed &amp; Token Generated!
                </h2>
                <p className="text-xs text-emerald-800 max-w-md mx-auto">
                  Your payment of ₹{confirmedAppointment.serviceFee}.00 was verified. A confirmation email with your appointment token was sent to <strong className="text-emerald-950">{confirmedAppointment.email}</strong>.
                </p>

                {/* THE TOKEN BADGE */}
                <div className="bg-white border-2 border-emerald-400 rounded-2xl p-6 shadow-sm my-4">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Your Official Appointment Token ID
                  </div>
                  <div className="font-mono text-2xl sm:text-3xl font-extrabold text-blue-700 tracking-wide mt-1 select-all">
                    {confirmedAppointment.id}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    Attending Physician: <strong className="text-slate-900">{confirmedAppointment.doctorName}</strong> ({confirmedAppointment.hospitalName})
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Schedule: <strong className="text-slate-900">{confirmedAppointment.appointmentDate}</strong> at <strong className="text-slate-900">{confirmedAppointment.timeSlot}</strong>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEmailModalOpen(true)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>✉️</span>
                    <span>Inspect Dispatched Email</span>
                  </button>

                  <Link
                    href="/doctor"
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    <span>🩺 Open Doctor Terminal (Laptop 2) →</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setConfirmedAppointment(null);
                      setBookingStep(1);
                    }}
                    className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl transition"
                  >
                    Book Another Appointment
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LOOKUP MY TOKEN & RECORDS */}
      {activeTab === 'lookup' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 max-w-2xl mx-auto">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Lookup Appointment Status &amp; Medical Records</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your Token ID (e.g. <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">APT-APO-2026-8812</code>) or registered email address.
            </p>
          </div>

          <form onSubmit={handleLookupToken} className="flex gap-2">
            <input
              type="text"
              value={searchToken}
              onChange={(e) => setSearchToken(e.target.value)}
              placeholder="e.g. APT-APO-2026-8812 or jane.doe@healthmail.com"
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer"
            >
              Search
            </button>
          </form>

          {lookupError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {lookupError}
            </div>
          )}

          {lookupResult && (
            <div className="border border-slate-200 rounded-2xl p-5 space-y-4 bg-slate-50/50">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Token ID</span>
                  <div className="font-mono text-base font-extrabold text-blue-700">{lookupResult.id}</div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  lookupResult.status === 'COMPLETED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {lookupResult.status === 'COMPLETED' ? '✓ Consultation Complete' : '⏳ Pending Examination'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient Name</span>
                  <strong className="text-slate-900">{lookupResult.patientName} ({lookupResult.bloodType})</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Attending Doctor</span>
                  <strong className="text-slate-900">{lookupResult.doctorName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Facility</span>
                  <span className="text-slate-700">{lookupResult.hospitalName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Date &amp; Time</span>
                  <span className="text-slate-700">{lookupResult.appointmentDate} ({lookupResult.timeSlot})</span>
                </div>
              </div>

              {lookupResult.status === 'COMPLETED' ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs space-y-2">
                  <div className="font-bold text-emerald-900">Diagnosis &amp; Examination:</div>
                  <p className="text-emerald-800">{lookupResult.diagnosis}</p>
                  <div className="font-mono text-[10px] text-emerald-700 truncate">
                    Unique Medical Record Key: {lookupResult.recordKey}
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900">
                  Please proceed to the examination room or wait for the physician to call your Token ID on the Doctor Workstation.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: 3-DEVICE ARCHITECTURE BLUEPRINT */}
      {activeTab === 'architecture' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Device 1 */}
          <div className="bg-white rounded-2xl border-2 border-blue-200 p-6 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold">
              💻
            </div>
            <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Device 1 • Laptop</div>
            <h3 className="text-base font-bold text-slate-900">Patient Registration &amp; Booking</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Patient selects hospital facility, doctor, emergency triage vitals, and pays service fee (₹500). Generates appointment Token ID and triggers real-time block generation on blockchain.
            </p>
            <div className="pt-3 border-t border-slate-100 text-xs font-mono text-blue-700">
              Endpoint: /
            </div>
          </div>

          {/* Device 2 */}
          <div className="bg-white rounded-2xl border-2 border-indigo-200 p-6 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl font-bold">
              💻
            </div>
            <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Device 2 • Laptop</div>
            <h3 className="text-base font-bold text-slate-900">Doctor Terminal &amp; Blockchain Monitor</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Doctor examines patient, inputs diagnostic reports &amp; prescriptions, encrypts records with AES-256-GCM, generates MediQR &amp; unique record key, and watches real-time blocks link on screen.
            </p>
            <div className="pt-3 border-t border-slate-100 text-xs font-mono text-indigo-700">
              Endpoints: /doctor &amp; /blockchain
            </div>
          </div>

          {/* Device 3 */}
          <div className="bg-white rounded-2xl border-2 border-rose-200 p-6 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center text-xl font-bold">
              📱
            </div>
            <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Device 3 • Mobile Phone</div>
            <h3 className="text-base font-bold text-slate-900">Paramedic Emergency QR Access</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Phone camera scans the patient's MediQR over the private ESP32 network without internet. Displays critical blood type, allergy alerts, and emergency contact in 0.02s.
            </p>
            <div className="pt-3 border-t border-slate-100 text-xs font-mono text-rose-700">
              Endpoint: /emergency
            </div>
          </div>
        </div>
      )}

      {/* Outbound Email Modal */}
      <EmailInboxModal isOpen={emailModalOpen} onClose={() => setEmailModalOpen(false)} />
    </div>
  );
}
