'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Clock, CheckSquare, Plus, FileSignature, FolderOpen, Smartphone } from 'lucide-react';
import type { Client } from '@/types/client';

interface MemoryCardModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateClient: (updated: Client) => void;
}

export function MemoryCardModal({
  client,
  isOpen,
  onClose,
  onUpdateClient,
}: MemoryCardModalProps) {
  if (!isOpen || !client) return null;

  const [notes, setNotes] = useState('');
  const [checklist, setChecklist] = useState([
    { id: '1', text: 'Official Identification Document (RG/CNH)', done: true },
    { id: '2', text: 'Updated Proof of Residence', done: true },
    { id: '3', text: 'Social Security Contribution Extract (CNIS)', done: false },
    { id: '4', text: 'Rural Syndicate Statement / Medical Report', done: false },
  ]);

  const toggleItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const handleEmitContract = () => {
    const updated: Client = {
      ...client,
      status: 'CLOSED',
      visitCount: client.visitCount + 1,
      lastVisitAt: new Date().toISOString(),
      notes: notes ? `${notes} — OAB Power of Attorney and Fee Contract signed.` : 'Contract signed.',
    };
    onUpdateClient(updated);
    alert(`✅ Contract & OAB Power of Attorney issued successfully for ${client.fullName}!`);
    onClose();
  };

  const handleAddVisit = () => {
    const updated: Client = {
      ...client,
      visitCount: client.visitCount + 1,
      lastVisitAt: new Date().toISOString(),
      notes: notes || client.notes,
      status: client.status === 'PROSPECT' ? 'PENDING' : client.status,
    };
    onUpdateClient(updated);
    alert(`✅ Visit #${updated.visitCount} registered for ${client.fullName}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#0B192E]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#0B192E] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Clock className="w-4 h-4 text-[#C89543]" />
            Immediate Memory Card (Return Consultation Context)
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5">
          {/* Client Profile Header Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#C89543] to-[#dfad5e] text-[#0B192E] font-extrabold text-xl flex items-center justify-center shadow-md flex-shrink-0 border-2 border-white">
              {client.fullName.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-grow">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-base">{client.fullName}</h3>
                <span className="bg-[#FDF8ED] text-[#92400E] border border-[#C89543]/40 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Visit #{client.visitCount} (Return)
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                <strong className="text-[#0B192E]">{client.benefitType || 'General Consultation'}</strong> · {client.mobilePhone} {client.cpf ? `· CPF: ${client.cpf}` : ''}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                  <Smartphone className="w-3 h-3" /> Android App Synced
                </span>
                <Link
                  href={`/clientes/${client.id}`}
                  className="text-[11px] font-semibold text-[#0B192E] bg-white border border-slate-300 hover:bg-slate-100 px-2.5 py-0.5 rounded-md transition-colors"
                >
                  Open Full File (32 Fields)
                </Link>
              </div>
            </div>
          </div>

          {/* What happened on the last visit */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#0B192E] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C89543]" />
              What happened on the last visit?
            </div>
            <div className="bg-slate-50 border-l-4 border-[#C89543] p-3 rounded-r-lg text-xs leading-relaxed text-slate-800">
              {client.notes || 'No preliminary notes recorded on previous intake.'}
            </div>
          </div>

          {/* Pending Physical Documents Checklist */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-[#0B192E] flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#C89543]" />
                What was missing to proceed? (Physical Folder Checklist)
              </div>
              <span className="text-[11px] text-[#C89543] font-bold">
                Check items delivered today
              </span>
            </div>
            <div className="flex flex-col gap-1.5 mt-1">
              {checklist.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer text-xs transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => toggleItem(item.id)}
                    className="w-4 h-4 accent-[#C89543] rounded"
                  />
                  <span
                    className={
                      item.done
                        ? 'line-through text-slate-400'
                        : 'font-medium text-slate-800'
                    }
                  >
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Return Visit Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#0B192E]">
              Current Return Notes (What did the client bring or report today?)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Client delivered rural union certificates today. Physical documentation verified and complete."
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#C89543] focus:bg-white min-h-[75px]"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleAddVisit}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#0B192E] hover:bg-[#132742] transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Record Another Visit
          </button>
          <button
            onClick={handleEmitContract}
            className="px-4 py-2 rounded-lg text-xs font-bold text-[#0B192E] bg-[#C89543] hover:bg-[#B38234] transition-colors shadow-sm inline-flex items-center gap-1.5"
          >
            <FileSignature className="w-3.5 h-3.5" />
            Issue OAB Contract & POA
          </button>
        </div>
      </div>
    </div>
  );
}
