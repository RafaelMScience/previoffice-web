'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  ChevronDown,
  UserX,
  RotateCcw,
  Scale,
  ChevronRight,
  Home,
  FileText,
  Printer,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useAuth } from '@/lib/auth/auth-context';
import { maskPhone, maskCpf } from '@/lib/utils/masks';
import { formatBenefitType } from '@/lib/utils/benefit-translations';
import type { Client, ClientStatus } from '@/types/client';
import type { CaseUpdate } from '@/types/case-update';

interface ClientDetailHeaderProps {
  client: Client;
  latestCaseUpdate?: CaseUpdate;
  onOpenNewAttendance: () => void;
  onOpenContracts: () => void;
  onOpenPdfReport?: () => void;
  onOpenMemoryCard: () => void;
  onStatusChange?: (newStatus: ClientStatus) => void;
  onInactivateClick?: () => void;
  onReactivateClick?: () => void;
  onSelectProcessTab?: () => void;
}

export function ClientDetailHeader({
  client,
  latestCaseUpdate,
  onOpenNewAttendance,
  onOpenContracts,
  onOpenPdfReport,
  onOpenMemoryCard,
  onStatusChange,
  onInactivateClick,
  onReactivateClick,
  onSelectProcessTab,
}: ClientDetailHeaderProps) {
  const { t } = useI18n();
  const { canAccess } = useAuth();
  const router = useRouter();
  const [isStatusMenuOpen, setIsStatusMenuOpen] = React.useState(false);

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
      {/* Top row: smart back button and breadcrumb navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 flex-wrap text-xs font-medium text-slate-500">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                router.back();
              } else {
                router.push('/');
              }
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer"
            title="Voltar à tela anterior"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar</span>
          </button>

          <span className="text-slate-300">|</span>

          {/* Breadcrumb Navigation */}
          <Link
            href="/"
            className="hover:text-[#0B192E] flex items-center gap-1 transition-colors"
            title="Painel Geral da Fila"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Fila de Clientes</span>
          </Link>

          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />

          <Link
            href="/attendances"
            className="hover:text-[#C89543] flex items-center gap-1 transition-colors"
            title="Central de Atendimentos"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Atendimentos</span>
          </Link>

          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />

          <span className="text-slate-900 font-semibold truncate max-w-[200px]" title={client.fullName}>
            {client.fullName}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
              className="inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#C89543] rounded-full"
              title={t.clientDetails.btnChangeStatus}
            >
              {getStatusBadge()}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hover:text-slate-700" />
            </button>

            {isStatusMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1.5 text-xs animate-in fade-in">
                <span className="block px-3 py-1 font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  {t.clientDetails.btnChangeStatus}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    onStatusChange && onStatusChange('PROSPECT');
                    setIsStatusMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>{t.clientDetails.statusProspect}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onStatusChange && onStatusChange('PENDING');
                    setIsStatusMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>{t.clientDetails.statusPending}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onStatusChange && onStatusChange('CLOSED');
                    setIsStatusMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>{t.clientDetails.statusClosed}</span>
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  type="button"
                  onClick={() => {
                    onInactivateClick && onInactivateClick();
                    setIsStatusMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-700 font-medium"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>{t.clientDetails.btnInactivate}</span>
                </button>
              </div>
            )}
          </div>

          {/* LGPD Compliance Badge */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.clientDetails.lgpdComplianceBadge}</span>
          </div>

          <span className="text-xs text-slate-400 font-mono">ID: {client.id.slice(0, 8)}</span>
        </div>
      </div>

      {/* Inactive Client Alert Banner */}
      {!client.active && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <UserX className="w-4 h-4 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold">{t.clientDetails.clientInactivatedBanner}:</span>{' '}
              {client.inactivationReason || 'Desistência / Encerramento do caso'}{' '}
              {client.inactivatedAt && (
                <span className="text-slate-500 font-mono text-[11px]">
                  ({new Date(client.inactivatedAt).toLocaleDateString('pt-BR')})
                </span>
              )}
            </div>
          </div>

          {onReactivateClick && (
            <button
              onClick={onReactivateClick}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-rose-100 text-rose-800 text-xs font-bold rounded-lg border border-rose-300 transition-colors shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.clientDetails.btnReactivate}</span>
            </button>
          )}
        </div>
      )}

      {/* Latest Procedural Update Banner */}
      {latestCaseUpdate && (
        <div className="mb-4 p-3.5 bg-linear-to-r from-amber-50/90 via-white to-amber-50/50 border border-amber-200 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <span className="p-1 rounded-lg bg-amber-100 text-amber-800 shrink-0">
              <Scale className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-amber-950 uppercase tracking-wide text-[10px] bg-amber-200/60 px-2 py-0.5 rounded">
                  {t.clientDetails.latestUpdateNotification}
                </span>
                <span className="text-slate-500 font-mono text-[11px]">
                  {new Date(latestCaseUpdate.eventDate).toLocaleDateString('pt-BR')} • {latestCaseUpdate.forumOrAgency}
                </span>
              </div>
              <p className="font-semibold text-slate-800 mt-0.5">
                {latestCaseUpdate.title}
                {latestCaseUpdate.description && (
                  <span className="font-normal text-slate-600 block sm:inline sm:ml-1">
                    — {latestCaseUpdate.description}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {latestCaseUpdate.notifyClientText && cleanPhone && (
              <a
                href={`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
                  latestCaseUpdate.notifyClientText
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors text-xs shadow-xs"
                title="Avisar cliente sobre este andamento via WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{t.clientDetails.btnNotifyClient}</span>
              </a>
            )}
            {onSelectProcessTab && (
              <button
                type="button"
                onClick={onSelectProcessTab}
                className="px-2.5 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg font-semibold text-xs transition-colors"
              >
                Ver histórico
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main header body */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Avatar & Personal Info */}
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#0B192E] text-[#C89543] font-bold text-xl flex items-center justify-center shadow-inner shrink-0 border border-slate-700 overflow-hidden">
            {client.photoReference ? (
              <img
                src={client.photoReference}
                alt={client.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              getInitials(client.fullName)
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">{client.fullName}</h1>
              {client.benefitType && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  {formatBenefitType(client.benefitType, 'pt-BR')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap">
              {client.cpf && (
                <span>
                  <strong>CPF:</strong> {maskCpf(client.cpf)}
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
                  {maskPhone(client.mobilePhone || client.phone)}
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
          {canAccess('receptionDesk') && (
            <button
              onClick={onOpenNewAttendance}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0B192E] hover:bg-[#142642] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-[#C89543]" />
              <span>{t.clientDetails.btnNewAttendance}</span>
            </button>
          )}

          {/* Action: Generate Contract / Procuracao */}
          {canAccess('contractsAndFinancial') && (
            <button
              onClick={onOpenContracts}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C89543] hover:bg-[#b08137] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <FileSignature className="w-4 h-4" />
              <span>{t.clientDetails.btnGenerateContracts}</span>
            </button>
          )}

          {/* Action: Client Record & PDF Report */}
          {onOpenPdfReport && (
            <button
              onClick={onOpenPdfReport}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 shadow-2xs hover:border-slate-400 transition-colors"
              title={t.clientDetails.clientPdfModalTitle}
            >
              <Printer className="w-4 h-4 text-[#0B192E]" />
              <span>{t.clientDetails.btnClientPdfReport}</span>
            </button>
          )}

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
