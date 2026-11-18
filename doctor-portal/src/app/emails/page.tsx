'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SentEmail, getStoredEmails, clearAllEmails } from '../../lib/email-service';

export default function EmailsLivePage() {
  const [emails, setEmails] = useState<SentEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<SentEmail | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'APPOINTMENT_CONFIRMATION' | 'MEDIQR_RECORD_DELIVERY'>('ALL');
  const [search, setSearch] = useState('');
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load emails and setup real-time listeners for instant cross-tab updates
  const reloadEmails = () => {
    const list = getStoredEmails();
    setEmails(list);
    if (!selectedEmail && list.length > 0) {
      setSelectedEmail(list[0]);
    } else if (selectedEmail) {
      // keep selected email fresh
      const updated = list.find((e) => e.id === selectedEmail.id);
      if (updated) setSelectedEmail(updated);
      else if (list.length > 0) setSelectedEmail(list[0]);
      else setSelectedEmail(null);
    }
  };

  useEffect(() => {
    reloadEmails();

    const handleDispatched = (e: Event) => {
      const customEvent = e as CustomEvent<SentEmail[]>;
      if (customEvent.detail) {
        setEmails(customEvent.detail);
        if (customEvent.detail.length > 0) {
          setSelectedEmail(customEvent.detail[0]);
          setToastMessage(`New email received: ${customEvent.detail[0].subject}`);
          setTimeout(() => setToastMessage(null), 4000);
        }
      } else {
        reloadEmails();
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key && e.key.includes('mediqr_consortium_sent_emails')) {
        reloadEmails();
      }
    };

    window.addEventListener('mediqr_email_dispatched', handleDispatched);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('mediqr_email_dispatched', handleDispatched);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const handleClearAll = () => {
    if (confirm('Clear all sent emails from outbox? (Demonstration data will be purged)')) {
      clearAllEmails();
      setEmails([]);
      setSelectedEmail(null);
      setToastMessage('All dispatched emails have been cleared.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const copyToClipboard = (text: string, isToken: boolean) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (isToken) {
        setCopiedToken(true);
        setTimeout(() => setCopiedToken(false), 2000);
      } else {
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
      }
    }
  };

  const filteredEmails = emails.filter((em) => {
    if (filter !== 'ALL' && em.type !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchSubject = em.subject.toLowerCase().includes(q);
      const matchTo = em.to.toLowerCase().includes(q);
      const matchName = em.recipientName.toLowerCase().includes(q);
      const matchToken = em.appointmentToken?.toLowerCase().includes(q);
      return matchSubject || matchTo || matchName || matchToken;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white text-xs font-mono px-4 py-2.5 rounded-xl shadow-2xl border border-emerald-400 flex items-center gap-2 animate-bounce">
          <span>🔔</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Control Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></span>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Live Dispatch Mail Service
            </h1>
            <span className="text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
              {emails.length} DISPATCHED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time listener for automated patient booking confirmations, ₹500 payment receipts, and cryptographic MediQR key delivery.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/book"
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono transition shadow-md shadow-cyan-600/20"
          >
            + Book Patient Consultation (₹500)
          </Link>
          <button
            type="button"
            onClick={reloadEmails}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-mono transition"
            title="Reload outbox from local storage"
          >
            ↻ Refresh
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-mono transition"
            title="Purge all test emails"
          >
            🗑️ Clear All
          </button>
        </div>
      </div>

      {/* Filter and Search Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/50 border border-slate-800/80 rounded-xl p-3">
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'ALL'
                ? 'bg-cyan-600 text-white font-bold'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            All Outbox ({emails.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('APPOINTMENT_CONFIRMATION')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'APPOINTMENT_CONFIRMATION'
                ? 'bg-cyan-600 text-white font-bold'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            Booking Tokens ({emails.filter((e) => e.type === 'APPOINTMENT_CONFIRMATION').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('MEDIQR_RECORD_DELIVERY')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'MEDIQR_RECORD_DELIVERY'
                ? 'bg-cyan-600 text-white font-bold'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            Record &amp; QR Delivery ({emails.filter((e) => e.type === 'MEDIQR_RECORD_DELIVERY').length})
          </button>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipient, token, email..."
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 font-mono"
          />
        </div>
      </div>

      {/* Main Split Window */}
      {filteredEmails.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-3xl mx-auto">
            📬
          </div>
          <h3 className="text-base font-bold text-white">Outbox is Currently Clean</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No dispatched emails in the system. Book an appointment from the patient portal or complete a consultation in the Doctor EMR to see real-time automated emails.
          </p>
          <Link
            href="/book"
            className="inline-block px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono transition"
          >
            Book Demo Patient Care →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Email Thread List */}
          <div className="lg:col-span-5 space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {filteredEmails.map((em) => {
              const isSelected = selectedEmail?.id === em.id;
              const isToken = em.type === 'APPOINTMENT_CONFIRMATION';
              return (
                <div
                  key={em.id}
                  onClick={() => setSelectedEmail(em)}
                  className={`p-4 rounded-xl border transition cursor-pointer text-left ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`text-[9.5px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        isToken
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                          : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {isToken ? '💳 Booking Token' : '🛡️ MediQR Delivery'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(em.sentAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-white line-clamp-1">
                    {em.subject}
                  </h4>

                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {em.bodyPreview}
                  </p>

                  <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-white/5 text-[10px] font-mono text-slate-500">
                    <span className="truncate text-slate-400">To: {em.to}</span>
                    {em.appointmentToken && (
                      <span className="text-cyan-400 font-bold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/50 shrink-0">
                        {em.appointmentToken}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Full Email Inspection View */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            {selectedEmail ? (
              <div>
                
                {/* Email Metadata Header Bar */}
                <div className="bg-slate-950 p-5 border-b border-slate-800 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-mono text-cyan-400 font-bold">
                      {selectedEmail.id}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Dispatched: {new Date(selectedEmail.sentAt).toLocaleString()}
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-white leading-snug">
                    {selectedEmail.subject}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="text-slate-500">From: </span>
                      <span className="text-slate-300">MediQR Consortium Gateway</span>
                    </div>
                    <div>
                      <span className="text-slate-500">To: </span>
                      <span className="text-cyan-300 font-semibold">{selectedEmail.recipientName} &lt;{selectedEmail.to}&gt;</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Provider: </span>
                      <span className="text-slate-300">{selectedEmail.hospitalName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Physician: </span>
                      <span className="text-slate-300">{selectedEmail.doctorName}</span>
                    </div>
                  </div>

                  {/* Token & Key Quick Action Strip */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
                    {selectedEmail.appointmentToken && (
                      <div className="flex items-center gap-1.5 bg-cyan-950/40 border border-cyan-800/60 px-3 py-1.5 rounded-xl">
                        <span className="text-slate-400 text-[11px]">TOKEN:</span>
                        <span className="text-cyan-300 font-bold font-mono">{selectedEmail.appointmentToken}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(selectedEmail.appointmentToken!, true)}
                          className="ml-1 text-[10px] bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 px-2 py-0.5 rounded cursor-pointer"
                        >
                          {copiedToken ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                    )}

                    {selectedEmail.recordKey && (
                      <div className="flex items-center gap-1.5 bg-indigo-950/40 border border-indigo-800/60 px-3 py-1.5 rounded-xl">
                        <span className="text-slate-400 text-[11px]">KEY:</span>
                        <span className="text-indigo-300 font-mono text-[11px] truncate max-w-[120px]">
                          {selectedEmail.recordKey.slice(0, 16)}...
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(selectedEmail.recordKey!, false)}
                          className="ml-1 text-[10px] bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 px-2 py-0.5 rounded cursor-pointer"
                        >
                          {copiedKey ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rendered Email Body Canvas */}
                <div className="p-6 bg-slate-950/60 overflow-x-auto">
                  <div
                    className="prose prose-invert max-w-none text-slate-800 bg-white rounded-2xl p-6 sm:p-8 shadow-inner font-sans"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml }}
                  />
                </div>

              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 font-mono text-xs">
                Select an email from the left outbox list to view details
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}