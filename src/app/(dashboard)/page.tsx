'use client';

import React, { useState } from 'react';
import {
  Users,
  FileCheck2,
  Clock,
  TrendingUp,
  PlusCircle,
  FolderOpen,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { ReceptionTable, type ReceptionTableRow } from '@/components/reception/reception-table';
import { MemoryCardModal } from '@/components/memory-card/memory-card-modal';
import { FastIntakeModal, type FastIntakeData } from '@/components/reception/fast-intake-modal';
import { useI18n } from '@/lib/i18n/i18n-context';
import type { Client } from '@/types/client';

export default function ReceptionDashboardPage() {
  const { t } = useI18n();

  // Reception table state
  const [receptionRows, setReceptionRows] = useState<ReceptionTableRow[]>([
    {
      id: 'cli-001',
      fullName: 'Maria Francisca da Silva',
      cpf: '12345678909',
      attendanceType: 'RETURN_DOCUMENTS',
      lastVisitAt: '09:15',
      totalVisits: 3,
      pendingDocuments: ['Contrato de Terra Rural (ITR)', 'Declaração do Sindicato'],
      registrationProgress: 35,
      assignedAttendant: 'Camila Recepção',
      benefitTypeNotes: 'Rural Special Retirement',
    },
    {
      id: 'cli-002',
      fullName: 'Severino Manoel dos Santos',
      cpf: '98765432100',
      attendanceType: 'FIRST_VISIT',
      lastVisitAt: '10:30',
      totalVisits: 1,
      pendingDocuments: ['Laudo Médico Pericial (CID M54.5)', 'Histórico CNIS'],
      registrationProgress: 20,
      assignedAttendant: 'Camila Recepção',
      benefitTypeNotes: 'BPC/LOAS Disability Benefit',
    },
    {
      id: 'cli-003',
      fullName: 'Antonia Ribeiro de Lima',
      cpf: '45678912300',
      attendanceType: 'CONTRACT_SIGNING',
      lastVisitAt: '11:00',
      totalVisits: 2,
      pendingDocuments: [],
      registrationProgress: 75,
      assignedAttendant: 'Dr. Alexandre Pontes',
      benefitTypeNotes: 'Age Retirement (Urban)',
    },
    {
      id: 'cli-004',
      fullName: 'Josefa Clementina Alves',
      cpf: '65432198711',
      attendanceType: 'GENERAL_QUERY',
      lastVisitAt: '16:45',
      totalVisits: 4,
      pendingDocuments: ['Comprovante de Residência Atualizado'],
      registrationProgress: 60,
      assignedAttendant: 'Camila Recepção',
      benefitTypeNotes: 'Social Security Administrative Review',
    },
  ]);

  const [visitsTodayCount, setVisitsTodayCount] = useState(12);
  const [fastIntakeSuccessMsg, setFastIntakeSuccessMsg] = useState<string | null>(null);

  // Modals state
  const [isFastIntakeOpen, setIsFastIntakeOpen] = useState(false);
  const [selectedClientForMemoryCard, setSelectedClientForMemoryCard] = useState<Client | null>(null);
  const [isMemoryCardOpen, setIsMemoryCardOpen] = useState(false);

  // Handle Fast Intake Success
  const handleFastIntakeSuccess = (data: FastIntakeData) => {
    const newRow: ReceptionTableRow = {
      id: `cli-${Date.now()}`,
      fullName: data.fullName,
      cpf: data.cpf || '00000000000',
      attendanceType: 'FIRST_VISIT',
      lastVisitAt: 'Agora / Just now',
      totalVisits: 1,
      pendingDocuments: ['Verificação de Documentos Físicos'],
      registrationProgress: 20,
      assignedAttendant: 'Camila Recepção',
      benefitTypeNotes: data.benefit,
    };

    setReceptionRows((prev) => [newRow, ...prev]);
    setVisitsTodayCount((prev) => prev + 1);

    setFastIntakeSuccessMsg(
      `${t.fastIntake.successMessage} (${data.fullName} — ${data.phone})`
    );
    setTimeout(() => setFastIntakeSuccessMsg(null), 5000);
  };

  const handleOpenMemoryCard = (row: ReceptionTableRow) => {
    const clientObj: Client = {
      id: row.id,
      tenantId: 'tenant-demo',
      fullName: row.fullName,
      normalizedName: row.fullName.toLowerCase(),
      cpf: row.cpf,
      normalizedCpf: row.cpf.replace(/\D/g, ''),
      benefitType: row.benefitTypeNotes || 'Rural Special Retirement',
      visitCount: row.totalVisits,
      lastVisitAt: row.lastVisitAt,
      lastAttendantName: row.assignedAttendant,
      status: row.totalVisits > 1 ? 'PENDING' : 'PROSPECT',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: 'Initial reception intake recorded. Physical folder pending verification.',
    };

    setSelectedClientForMemoryCard(clientObj);
    setIsMemoryCardOpen(true);
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
          <p className="text-sm text-slate-300 mt-1">
            {t.dashboard.bannerDescription}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsFastIntakeOpen(true)}
            className="px-5 py-2.5 rounded-lg bg-[#C89543] text-[#0B192E] font-bold text-xs uppercase tracking-wider hover:bg-[#d5a557] flex items-center gap-2 shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>{t.dashboard.fastIntakeBtn}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Bar */}
      {fastIntakeSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{fastIntakeSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setFastIntakeSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.dashboard.metricVisitsToday}
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{visitsTodayCount}</h3>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {t.dashboard.metricVsYesterday}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.dashboard.metricDocReturns}
            </p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">5</h3>
            <span className="text-xs text-amber-600 font-medium flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5" />
              {t.dashboard.metricMemoryCardLabel}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FolderOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.dashboard.metricContractsSigned}
            </p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">3</h3>
            <span className="text-xs text-slate-500 font-medium mt-1">
              {t.dashboard.metricOabAgreement}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileCheck2 className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.dashboard.metricStorageCost}
            </p>
            <h3 className="text-2xl font-bold text-[#C89543] mt-1">$0.00</h3>
            <span className="text-xs text-slate-500 font-medium mt-1">
              {t.dashboard.metricPhysicalArchive}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50/50 text-[#C89543] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Reception Queue & Client Table */}
      <ReceptionTable
        initialRows={receptionRows}
        onOpenMemoryCard={handleOpenMemoryCard}
      />

      {/* Fast Intake Modal (15-second arrival registration) */}
      <FastIntakeModal
        isOpen={isFastIntakeOpen}
        onClose={() => setIsFastIntakeOpen(false)}
        onSubmitSuccess={handleFastIntakeSuccess}
      />

      {/* Memory Card Modal for Return Visits */}
      <MemoryCardModal
        isOpen={isMemoryCardOpen}
        onClose={() => setIsMemoryCardOpen(false)}
        client={selectedClientForMemoryCard}
        onUpdateClient={(updated) => setSelectedClientForMemoryCard(updated)}
      />
    </div>
  );
}
