'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  FileCheck2,
  Clock,
  TrendingUp,
  PlusCircle,
  FolderOpen,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import { ReceptionTable, type ReceptionTableRow } from '@/components/reception/reception-table';
import { DashboardTableSkeleton } from '@/components/dashboard/dashboard-table-skeleton';
import { MemoryCardModal } from '@/components/memory-card/memory-card-modal';
import { FastIntakeModal, type FastIntakeData } from '@/components/reception/fast-intake-modal';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useAuth } from '@/lib/auth/auth-context';
import { AccessDeniedBoundary } from '@/components/ui/access-denied-boundary';
import { fetchClientsFromDb, createFastIntakeInDb } from '@/lib/services/client-service';
import { formatBenefitType } from '@/lib/utils/benefit-translations';
import type { Client } from '@/types/client';

export default function ReceptionDashboardPage() {
  const { t } = useI18n();
  const { canAccess, currentUser } = useAuth();

  // Reception table state
  const [receptionRows, setReceptionRows] = useState<ReceptionTableRow[]>([]);
  const [loadingRows, setLoadingRows] = useState<boolean>(true);
  const [visitsTodayCount, setVisitsTodayCount] = useState(0);
  const [fastIntakeSuccessMsg, setFastIntakeSuccessMsg] = useState<string | null>(null);

  // Modals state
  const [isFastIntakeOpen, setIsFastIntakeOpen] = useState(false);
  const [selectedClientForMemoryCard, setSelectedClientForMemoryCard] = useState<Client | null>(null);
  const [isMemoryCardOpen, setIsMemoryCardOpen] = useState(false);
  const [clientsCache, setClientsCache] = useState<Client[]>([]);

  const loadClients = useCallback(async () => {
    if (!currentUser?.tenantId) return;
    setLoadingRows(true);
    try {
      const clients = await fetchClientsFromDb(currentUser.tenantId);
      setClientsCache(clients);

      const rows: ReceptionTableRow[] = clients.map((c) => {
        const visitTime = c.lastVisitAt
          ? new Date(c.lastVisitAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          : 'Hoje';

        return {
          id: c.id,
          fullName: c.fullName,
          cpf: c.cpf || c.normalizedCpf || '---',
          photoUrl: c.photoReference || null,
          attendanceType: (c.visitCount > 1 ? 'RETURN' : 'FIRST_VISIT') as any,
          lastVisitAt: visitTime,
          totalVisits: c.visitCount || 1,
          pendingDocuments:
            c.pendingDocuments !== undefined
              ? c.pendingDocuments
              : c.hasActiveBenefit
              ? ['Análise Administrativa']
              : ['Documentos Pessoais e CNIS'],
          registrationProgress: c.cpf && c.street ? 80 : 35,
          assignedAttendant: c.lastAttendantName || currentUser.fullName,
          benefitTypeNotes: formatBenefitType(c.benefitType, 'pt-BR') || 'Benefício Previdenciário',
        };
      });

      setReceptionRows(rows);
      setVisitsTodayCount(clients.length);
    } catch (err) {
      console.error('Error loading clients from DB:', err);
    } finally {
      setLoadingRows(false);
    }
  }, [currentUser?.tenantId, currentUser?.fullName]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  if (!canAccess('receptionDesk')) {
    return (
      <AccessDeniedBoundary
        moduleName="Visitas & Triagem de Clientes"
        requiredPermissionLabel="Recepção e Triagem (receptionDesk)"
      />
    );
  }

  // Handle Fast Intake Success
  const handleFastIntakeSuccess = async (data: FastIntakeData) => {
    if (!currentUser?.tenantId) {
      throw new Error('Sessão expirada ou escritório não identificado. Recarregue a página.');
    }

    await createFastIntakeInDb(data, currentUser.tenantId, {
      id: currentUser.id,
      name: data.assignedLawyerName || currentUser.fullName,
    });

    setFastIntakeSuccessMsg(
      `${t.fastIntake.successMessage} (${data.fullName} — ${data.phone})`
    );
    setTimeout(() => setFastIntakeSuccessMsg(null), 5000);

    // Reload real clients from Supabase
    await loadClients();
  };

  const handleOpenMemoryCard = (row: ReceptionTableRow) => {
    const found = clientsCache.find((c) => c.id === row.id);
    if (found) {
      setSelectedClientForMemoryCard(found);
      setIsMemoryCardOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0B192E] to-[#142642] text-white p-6 rounded-2xl shadow-xs border border-white/10">
        <div>
          <div className="flex items-center gap-2 text-[#C89543] font-semibold text-xs tracking-wider uppercase mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>{t.dashboard.bannerSubtitle}</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">{t.dashboard.bannerTitle}</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            {t.dashboard.bannerDescription}
          </p>
        </div>

        {/* Action Button: Fast Intake */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsFastIntakeOpen(true)}
            className="bg-[#C89543] hover:bg-[#b08136] text-[#0B192E] font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-[#C89543]/20 flex items-center gap-2 text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.dashboard.fastIntakeBtn}</span>
          </button>
          <Link
            href="/clientes/new"
            className="bg-white/10 hover:bg-white/15 text-white font-medium px-4 py-2.5 rounded-xl transition-all border border-white/15 flex items-center gap-2 text-sm"
          >
            <FolderOpen className="w-4 h-4 text-[#C89543]" />
            <span>Ficha Completa (32 Campos)</span>
          </Link>
        </div>
      </div>

      {/* Fast Intake Success Alert */}
      {fastIntakeSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium rounded-xl flex items-center gap-3 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{fastIntakeSuccessMsg}</span>
        </div>
      )}

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-xl text-[#C89543]">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              {t.dashboard.metricVisitsToday}
            </span>
            <span className="text-2xl font-black text-slate-900">{visitsTodayCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Total de Clientes
            </span>
            <span className="text-2xl font-black text-slate-900">{receptionRows.length}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              {t.dashboard.metricDocReturns}
            </span>
            <span className="text-2xl font-black text-slate-900">
              {receptionRows.filter((r) => r.attendanceType === 'RETURN_DOCUMENTS' || r.attendanceType === 'RETURN').length}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Taxa de Retorno
            </span>
            <span className="text-2xl font-black text-slate-900">
              {receptionRows.length > 0
                ? `${Math.round(
                    (receptionRows.filter((r) => r.totalVisits >= 2).length / receptionRows.length) * 100
                  )}%`
                : '0%'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Reception Intake Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Fila de Recepção & Triagem</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                {receptionRows.length} clientes ativos
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Fila em tempo real sincronizada com o PostgreSQL do Supabase.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={loadClients}
              disabled={loadingRows}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Loader2 className={`w-3.5 h-3.5 ${loadingRows ? 'animate-spin text-[#C89543]' : ''}`} />
              <span>Atualizar</span>
            </button>
            <Link
              href="/clientes/new"
              className="text-xs font-semibold text-[#0B192E] hover:text-[#C89543] flex items-center gap-1 transition-colors"
            >
              <span>Cadastrar Novo</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {loadingRows ? (
          <DashboardTableSkeleton />
        ) : receptionRows.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3 bg-slate-50/50">
            <Users className="w-10 h-10 text-slate-300" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">Nenhum cliente cadastrado ainda</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Seu banco de dados do Supabase está pronto e conectado. Cadastre o primeiro cliente pelo botão de Entrada Rápida!
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsFastIntakeOpen(true)}
              className="mt-2 bg-[#C89543] hover:bg-[#b08136] text-[#0B192E] font-bold px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Registrar Primeiro Atendimento</span>
            </button>
          </div>
        ) : (
          <ReceptionTable
            rows={receptionRows}
            onOpenMemoryCard={handleOpenMemoryCard}
          />
        )}
      </div>

      {/* Fast Intake Modal */}
      <FastIntakeModal
        isOpen={isFastIntakeOpen}
        onClose={() => setIsFastIntakeOpen(false)}
        onSubmitSuccess={handleFastIntakeSuccess}
      />

      {/* Memory Card Modal */}
      {selectedClientForMemoryCard && (
        <MemoryCardModal
          isOpen={isMemoryCardOpen}
          onClose={() => {
            setIsMemoryCardOpen(false);
            setSelectedClientForMemoryCard(null);
          }}
          client={selectedClientForMemoryCard}
          onUpdateClient={() => loadClients()}
        />
      )}
    </div>
  );
}
