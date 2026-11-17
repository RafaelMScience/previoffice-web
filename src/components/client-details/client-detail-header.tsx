'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Phone,
  MessageCircle,
  FileSignature,
  PlusCircle,
  Clock,
  Calendar,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import type { Client } from '@/types/client';

interface ClientDetailHeaderProps {
  client: Client;
  onOpenNewAttendance: () => void;
  onOpenContracts: () => void;
  onOpenMemoryCard: () => void;
}

export function ClientDetailHeader({
  client,
  onOpenNewAttendance,
  onOpenContracts,
  onOpenMemoryCard,
}: ClientDetailHeaderProps) {
  const { t } = useI18n();

  const getStatusBadge = () => {
    switch (client.status) {
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t.clientDetails.statusClosed}
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            {t.clientDetails.statusPending}
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {t.clientDetails.statusInactive}
          </span>
        );
      case 'PROSPECT':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            {t.clientDetails.statusProspect}
          </span>
        );
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('');
  };

  const cleanPhone = (client.mobilePhone || client.phone || '').replace(/\D/g, '');
  const whatsappUrl = cleanPhone
    ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
        `Olá ${client.fullName}, aqui é do escritório de advocacia previdenciária.`
      )}`
    : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-6">
      {/* Top row: back link and breadcrumb */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Painel da Fila</span>
        </Link>

        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <span className="text-xs text-slate-400 font-mono">ID: {client.id.slice(0, 8)}</span>
        </div>
      </div>

      {/* Main header body */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Avatar & Personal Info */}
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#0B192E] text-[#C89543] font-bold text-xl flex items-center justify-center shadow-inner shrink-0 border border-slate-700">
            {getInitials(client.fullName)}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">{client.fullName}</h1>
              {client.benefitType && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  {client.benefitType}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap">
              {client.cpf && (
                <span>
                  <strong>CPF:</strong> {client.cpf}
                </span>
              )}
              {client.rg && (
                <span>
                  <strong>RG:</strong> {client.rg}
                </span>
              )}
              {client.birthDate && (
                <span>
                  <strong>Nasc:</strong> {new Date(client.birthDate).toLocaleDateString('pt-BR')}
                </span>
              )}
              {(client.mobilePhone || client.phone) && (
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {client.mobilePhone || client.phone}
                </span>
              )}
            </div>

            {whatsappUrl && (
              <div className="pt-1">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md transition-colors border border-emerald-200"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  {t.clientDetails.whatsappContact}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right: Visit Counter Badge & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Visit Counter Pill */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0B192E] text-white flex items-center justify-center font-bold text-sm shrink-0">
              {client.visitCount}
            </div>
            <div className="text-xs">
              <div className="font-bold text-slate-900">
                {client.visitCount <= 1
                  ? '1ª Visita Presencial'
                  : `${client.visitCount}ª Visita (${client.visitCount - 1}º Retorno)`}
              </div>
              <div className="text-slate-500 text-[11px] flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>
                  {client.lastVisitAt
                    ? `Última: ${new Date(client.lastVisitAt).toLocaleDateString('pt-BR')}`
                    : 'Hoje'}
                </span>
              </div>
            </div>
          </div>

          {/* Action: New Attendance / Return */}
          <button
            onClick={onOpenNewAttendance}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0B192E] hover:bg-[#142642] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-[#C89543]" />
            <span>{t.clientDetails.btnNewAttendance}</span>
          </button>

          {/* Action: Generate Contract / Procuracao */}
          <button
            onClick={onOpenContracts}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C89543] hover:bg-[#b08137] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <FileSignature className="w-4 h-4" />
            <span>{t.clientDetails.btnGenerateContracts}</span>
          </button>

          {/* Action: Memory Card */}
          <button
            onClick={onOpenMemoryCard}
            className="inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
            title={t.clientDetails.btnMemoryCard}
          >
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="hidden xl:inline">{t.clientDetails.btnMemoryCard}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
