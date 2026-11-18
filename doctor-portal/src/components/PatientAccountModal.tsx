'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PatientUser, getCurrentPatientUser, signOutPatient } from '../lib/patient-auth';
import {
  Appointment,
  getAppointmentsForUser,
  rescheduleAppointment,
} from '../lib/appointments';

interface PatientAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PatientAccountModal({ isOpen, onClose }: PatientAccountModalProps) {
  const [currentUser, setCurrentUser] = useState<PatientUser | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reschedulingAptId, setReschedulingAptId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newSlot, setNewSlot] = useState('11:00 AM - 11:30 AM');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [rescheduleMessage, setRescheduleMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const reloadData = () => {
    const user = getCurrentPatientUser();
    setCurrentUser(user);
    if (user) {
      const userApts = getAppointmentsForUser(user.email);
      setAppointments(userApts);
    } else {
      setAppointments([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      reloadData();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleAuthChange = () => reloadData();
    const handleAptChange = () => reloadData();
    window.addEventListener('mediqr_patient_auth_change', handleAuthChange);
    window.addEventListener('mediqr_appointment_updated', handleAptChange);
    window.addEventListener('storage', handleAptChange);
    return () => {
      window.removeEventListener('mediqr_patient_auth_change', handleAuthChange);
      window.removeEventListener('mediqr_appointment_updated', handleAptChange);
      window.removeEventListener('storage', handleAptChange);
    };
  }, []);

  if (!isOpen) return null;

  const handleCopyToken = (tokenId: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(tokenId);
      setCopiedToken(tokenId);
      setTimeout(() => setCopiedToken(null), 2500);
    }
  };

  const handleExecuteReschedule = (aptId: string) => {
    setRescheduleMessage(null);
    const result = rescheduleAppointment(aptId, newDate, newSlot);
    if (!result.success) {
      setRescheduleMessage({ type: 'error', text: result.error || 'Reschedule failed.' });
      return;
    }
    setRescheduleMessage({
      type: 'success',
      text: `✓ Appointment ${aptId} rescheduled to ${newDate} (${newSlot}). Policy Note: Rescheduled once (Limit Reached).`,
    });
    setReschedulingAptId(null);
    reloadData();
  };

  const latestApt = appointments[0];
  const stage = latestApt?.applicationStage || 'ALL_SET';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 font-bold text-lg shadow-sm">
              🔔
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">
                  Patient Health Hub &amp; Status
                </h3>
                <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full">
                  LIVE PORTAL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Manage appointment status, history, and single-use rescheduling.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* User Profile & Membership Badge */}
          {currentUser ? (
            <div className="bg-slate-950 border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName}
                    className="w-11 h-11 rounded-full border border-cyan-400 object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold text-base">
                    {currentUser.displayName.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    <span>{currentUser.displayName}</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                      {currentUser.provider === 'google' ? 'Google Account' : 'Verified Email'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">{currentUser.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[9px] font-mono uppercase text-slate-500 block">Membership Tier</span>
                  <span className="text-xs font-bold text-cyan-300 font-mono">
                    {currentUser.membershipTier}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    signOutPatient();
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center p-4 bg-slate-950 rounded-2xl border border-white/10">
              <p className="text-xs text-slate-400">You are currently browsing as a guest.</p>
              <Link
                href="/login"
                onClick={onClose}
                className="mt-2 inline-block px-4 py-1.5 bg-cyan-600 text-white rounded-xl text-xs font-bold font-mono"
              >
                Sign In to View Your History →
              </Link>
            </div>
          )}

          {/* 3-STAGE CHECK STATUS BAR */}
          <div className="bg-slate-950 border border-cyan-500/20 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-cyan-400 uppercase tracking-wider">
                Application Check Status Bar
              </span>
              <span className="text-slate-400 text-[11px]">
                {latestApt ? `Token: ${latestApt.id}` : 'No Active Appointment'}
              </span>
            </div>

            {/* Stepper Rails */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1">
              
              {/* Stage 1: Verifying */}
              <div className={`p-3 rounded-xl border transition ${
                stage === 'VERIFYING'
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-sm'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}>
                <div className="text-sm mb-1">{stage === 'VERIFYING' ? '⏳' : '✓'}</div>
                <div className="font-bold text-[11px]">(1) Verifying</div>
                <div className="text-[9.5px] text-slate-400 mt-0.5">Payment &amp; ID Check</div>
              </div>

              {/* Stage 2: Notifying hospital */}
              <div className={`p-3 rounded-xl border transition ${
                stage === 'NOTIFYING_HOSPITAL'
                  ? 'bg-blue-500/10 border-blue-500/40 text-blue-300 shadow-sm animate-pulse'
                  : stage === 'ALL_SET'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-slate-900 border-white/5 text-slate-500'
              }`}>
                <div className="text-sm mb-1">{stage === 'ALL_SET' ? '✓' : stage === 'NOTIFYING_HOSPITAL' ? '📡' : '2'}</div>
                <div className="font-bold text-[11px]">(2) Notifying hospital</div>
                <div className="text-[9.5px] text-slate-400 mt-0.5">Vault Synchronized</div>
              </div>

              {/* Stage 3: You are all set */}
              <div className={`p-3 rounded-xl border transition ${
                stage === 'ALL_SET'
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-sm font-bold'
                  : 'bg-slate-900 border-white/5 text-slate-500'
              }`}>
                <div className="text-sm mb-1">{stage === 'ALL_SET' ? '🎉' : '3'}</div>
                <div className="font-bold text-[11px]">(3) You are all set</div>
                <div className="text-[9.5px] text-slate-400 mt-0.5">Token Mined on Blockchain</div>
              </div>

            </div>
          </div>

          {/* Reschedule Notification Banner */}
          {rescheduleMessage && (
            <div className={`p-3.5 rounded-xl border text-xs font-mono flex items-center justify-between gap-2 ${
              rescheduleMessage.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
            }`}>
              <span>{rescheduleMessage.text}</span>
              <button
                type="button"
                onClick={() => setRescheduleMessage(null)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}

          {/* Appointment History List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300">
                Your Scheduled Consultations ({appointments.length})
              </h4>
              <Link
                href="/book"
                onClick={onClose}
                className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300"
              >
                + Book New Care (₹500)
              </Link>
            </div>

            {appointments.length === 0 ? (
              <div className="bg-slate-950 border border-white/10 rounded-2xl p-8 text-center space-y-2">
                <div className="text-2xl">📋</div>
                <p className="text-xs text-slate-400">No appointments found under this account.</p>
                <Link
                  href="/book"
                  onClick={onClose}
                  className="inline-block mt-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold rounded-xl"
                >
                  Book Doctor Consultation →
                </Link>
              </div>
            ) : (
              appointments.map((apt) => {
                const isCompleted = apt.status === 'COMPLETED';
                const canReschedule = !apt.hasRescheduled && (!apt.rescheduleCount || apt.rescheduleCount < 1) && !isCompleted;
                const isCurrentlyRescheduling = reschedulingAptId === apt.id;

                return (
                  <div
                    key={apt.id}
                    className="bg-slate-950 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-extrabold text-cyan-400 font-mono">
                          {apt.id}
                        </span>
                        
                        {/* Copy Token Number Shortcut */}
                        <button
                          type="button"
                          onClick={() => handleCopyToken(apt.id)}
                          className="px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800 text-[10px] font-mono text-cyan-300 transition flex items-center gap-1 cursor-pointer"
                          title="Copy Token Number to clipboard"
                        >
                          <span>{copiedToken === apt.id ? '✓' : '📋'}</span>
                          <span>{copiedToken === apt.id ? 'Copied Token!' : 'Copy Token'}</span>
                        </button>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {isCompleted ? '✓ Completed' : '⏳ Pending Examination'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Facility</span>
                        <strong className="text-white truncate block">{apt.hospitalName}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Doctor</span>
                        <span className="text-slate-300 truncate block">{apt.doctorName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Scheduled Date</span>
                        <span className="text-cyan-300 block">{apt.appointmentDate}</span>
                        <span className="text-[10px] text-slate-400">{apt.timeSlot}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Payment</span>
                        <span className="text-emerald-400 font-bold block">₹{apt.serviceFee}.00 PAID</span>
                      </div>
                    </div>

                    {/* Reschedule Bar */}
                    <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                      <div>
                        {apt.hasRescheduled ? (
                          <span className="text-amber-400 text-[11px] flex items-center gap-1">
                            <span>🔒</span>
                            <span>Rescheduled once (Strict Policy Limit Reached)</span>
                          </span>
                        ) : isCompleted ? (
                          <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                            <span>✓</span>
                            <span>Medical Consultation Finished</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">
                            Eligible for 1-time date/slot reschedule
                          </span>
                        )}
                      </div>

                      {canReschedule && !isCurrentlyRescheduling && (
                        <button
                          type="button"
                          onClick={() => setReschedulingAptId(apt.id)}
                          className="px-3.5 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <span>📅</span>
                          <span>Reschedule Appointment</span>
                        </button>
                      )}
                    </div>

                    {/* Interactive Reschedule Picker (When active) */}
                    {isCurrentlyRescheduling && (
                      <div className="p-4 bg-slate-900 border border-blue-500/40 rounded-xl space-y-3 mt-2 animate-fade-in font-mono text-xs">
                        <div className="flex items-center justify-between text-blue-300 font-bold">
                          <span>Select New Consultation Date &amp; Slot (1-Time Only)</span>
                          <button
                            type="button"
                            onClick={() => setReschedulingAptId(null)}
                            className="text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-1">New Date</label>
                            <input
                              type="date"
                              value={newDate}
                              onChange={(e) => setNewDate(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-1">New Time Slot</label>
                            <select
                              value={newSlot}
                              onChange={(e) => setNewSlot(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                            >
                              <option value="09:30 AM - 10:00 AM">09:30 AM - 10:00 AM</option>
                              <option value="11:00 AM - 11:30 AM">11:00 AM - 11:30 AM</option>
                              <option value="02:00 PM - 02:30 PM">02:00 PM - 02:30 PM</option>
                              <option value="04:30 PM - 05:00 PM">04:30 PM - 05:00 PM</option>
                            </select>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleExecuteReschedule(apt.id)}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition"
                        >
                          Confirm Reschedule (Sets Limit) →
                        </button>
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>
    </div>
  );
}