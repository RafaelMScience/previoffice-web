'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Clock, CheckSquare, Plus, FileSignature, FolderOpen, Smartphone } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { formatBenefitType } from '@/lib/utils/benefit-translations';
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
  const { t } = useI18n();

  const [notes, setNotes] = useState('');
  const [checklist, setChecklist] = useState([
    { id: '1', key: 'checkItem1' as const, done: true },
    { id: '2', key: 'checkItem2' as const, done: true },
    { id: '3', key: 'checkItem3' as const, done: false },
    { id: '4', key: 'checkItem4' as const, done: false },
  ]);

  if (!isOpen || !client) return null;

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
    alert(`✅ ${t.memoryCard.alertContractSuccess} ${client.fullName}!`);
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
    alert(`✅ ${t.memoryCard.alertVisitSuccess} ${client.fullName}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#0B192E] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-[#C89543] font-semibold text-xs tracking-wider uppercase mb-1">
            <Clock className="w-4 h-4" />
            <span>{t.memoryCard.title}</span>
          </div>

          <div className="flex items-start justify-between pr-8">
            <div className="flex items-center gap-3">
              {client.photoReference ? (
                <img
                  src={client.photoReference}
                  alt={client.fullName}
                  className="w-12 h-12 rounded-xl object-cover border border-white/20 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-white/10 text-[#C89543] font-bold text-sm flex items-center justify-center shrink-0 border border-white/10">
                  {client.fullName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">{client.fullName}</h2>
                <p className="text-xs text-white/70 mt-0.5">
                  {t.memoryCard.subtitle}
                </p>
              </div>
            </div>
            <span className="bg-[#C89543] text-[#0B192E] text-xs font-bold px-3 py-1 rounded-full shadow-xs shrink-0 self-center">
              {client.visitCount}ª {t.memoryCard.badgeVisit}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick Info Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">CPF:</span>
              <span className="font-semibold text-slate-800 font-mono">{client.cpf || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">{t.common.status}:</span>
              <span className="font-bold text-[#C89543]">
                {client.status === 'CLOSED' ? 'CONTRATO FECHADO' : client.status === 'PENDING' ? 'MATURAÇÃO' : 'PROSPECT'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Alvo / Benefício:</span>
              <span className="font-semibold text-slate-800">{formatBenefitType(client.benefitType, 'pt-BR') || 'Geral'}</span>
            </div>
          </div>

          {/* Pending Physical Checklist */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#C89543]" />
              {t.memoryCard.sectionChecklist}
            </h3>
            <div className="space-y-2">
              {checklist.map((item) => (
                <label
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    item.done
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900 font-medium'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => {}} // Controlled by label click
                    className="w-4 h-4 rounded text-[#C89543] focus:ring-[#C89543] border-slate-300"
                  />
                  <span className={item.done ? 'line-through text-emerald-700' : ''}>
                    {t.memoryCard[item.key]}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Attendant Return Notes */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-[#C89543]" />
              {t.memoryCard.sectionQuickNotes}
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.memoryCard.notesPlaceholder}
              rows={3}
              className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C89543] bg-slate-50 text-slate-800"
            />
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            href={`/clientes/${client.id}`}
            className="text-xs text-[#0B192E] font-semibold hover:text-[#C89543] flex items-center gap-1 transition-colors"
          >
            <span>Ver Ficha Completa (32 Campos) &rarr;</span>
          </Link>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleAddVisit}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-all shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              {t.memoryCard.btnRegisterVisit}
            </button>
            <button
              onClick={handleEmitContract}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold bg-[#0B192E] text-white hover:bg-[#142642] flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <FileSignature className="w-3.5 h-3.5 text-[#C89543]" />
              {t.memoryCard.btnEmitContract}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
