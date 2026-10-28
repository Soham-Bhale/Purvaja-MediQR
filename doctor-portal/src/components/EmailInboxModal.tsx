'use client';

import React, { useState, useEffect } from 'react';
import { getStoredEmails, SentEmail } from '../lib/email-service';

interface EmailInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterEmail?: string;
}

export default function EmailInboxModal({ isOpen, onClose, filterEmail }: EmailInboxModalProps) {
  const [emails, setEmails] = useState<SentEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<SentEmail | null>(null);

  useEffect(() => {
    function refresh() {
      const all = getStoredEmails();
      if (filterEmail) {
        setEmails(all.filter((e) => e.to.toLowerCase() === filterEmail.toLowerCase()));
      } else {
        setEmails(all);
      }
    }

    if (isOpen) {
      refresh();
      window.addEventListener('mediqr_email_dispatched', refresh);
      return () => window.removeEventListener('mediqr_email_dispatched', refresh);
    }
  }, [isOpen, filterEmail]);

  useEffect(() => {
    if (emails.length > 0 && !selectedEmail) {
      setSelectedEmail(emails[0]);
    }
  }, [emails, selectedEmail]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg">
              ✉️
            </div>
            <div>
              <h2 className="font-bold text-base">Consortium Dispatch Mail Server</h2>
              <p className="text-xs text-slate-400">
                Live Outbound Dispatch Logs for Appointment Tokens &amp; Emergency MediQR Codes
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Content split */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 overflow-hidden">
          {/* Left Email List */}
          <div className="md:col-span-5 border-r border-slate-200 overflow-y-auto p-3 space-y-2 bg-slate-50">
            <div className="text-[11px] font-bold text-slate-500 uppercase px-2 py-1">
              Outbound Queue ({emails.length})
            </div>
            {emails.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No outbound emails dispatched yet. Book an appointment to trigger delivery!
              </div>
            ) : (
              emails.map((email) => {
                const isSelected = selectedEmail?.id === email.id;
                return (
                  <button
                    key={email.id}
                    type="button"
                    onClick={() => setSelectedEmail(email)}
                    className={`w-full text-left p-3 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                        {email.type === 'APPOINTMENT_CONFIRMATION' ? '🎟️ Token' : '🛡️ MediQR'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(email.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-slate-900 truncate">{email.recipientName}</div>
                    <div className="text-[11px] text-slate-500 truncate">{email.to}</div>
                    <div className="text-[11px] font-medium text-slate-700 truncate mt-1">{email.subject}</div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Email Preview */}
          <div className="md:col-span-7 overflow-y-auto p-6 bg-white flex flex-col justify-between">
            {selectedEmail ? (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span><strong>To:</strong> {selectedEmail.recipientName} &lt;{selectedEmail.to}&gt;</span>
                    <span>{new Date(selectedEmail.sentAt).toLocaleString()}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{selectedEmail.subject}</h3>
                  <div className="text-xs text-slate-500 mt-1">
                    <strong>Sender:</strong> MediQR Consortium Healthcare Authority &lt;noreply@mediqr.org&gt;
                  </div>
                </div>

                {/* Rendered HTML email */}
                <div
                  className="email-rendered-preview rounded-xl border border-slate-100 p-2"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml }}
                />
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 text-xs">
                Select an email from the left to view the complete dispatched message.
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Status: Dispatched via SMTP / Consortium Push Service</span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium text-xs transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
