'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { FileText, CheckCircle2, PlusCircle, LayoutList, GitCommit, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import type { AttendanceWithClient } from '@/types/attendance';
import { useAuth } from '@/lib/auth/auth-context';
import { AccessDeniedBoundary } from '@/components/ui/access-denied-boundary';
import { fetchAttendancesFromDb } from '@/lib/services/client-service';
import { useDebounce } from '@/hooks/use-debounce';
import {
  AttendancesMetricsRow,
  type AttendanceFilterType,
  AttendancesSearchBar,
  AttendancesTableView,
  AttendancesTimelineView,
  NewGeneralAttendanceModal,
} from '@/features/attendances';

export default function AttendancesPage() {
  const { locale } = useI18n();
  const isEn = locale === 'en-US';
  const { canAccess, currentUser } = useAuth();

  const [attendances, setAttendances] = useState<AttendanceWithClient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [filterType, setFilterType] = useState<AttendanceFilterType>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadAttendances = useCallback(async () => {
    if (!currentUser?.tenantId) return;
    setLoading(true);
    try {
      const data = await fetchAttendancesFromDb(currentUser.tenantId);
      setAttendances(data);
    } catch (err) {
      console.error('Error fetching attendances from DB:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.tenantId]);

  useEffect(() => {
    loadAttendances();
  }, [loadAttendances]);

  const handleSaveAttendance = (newAtt: AttendanceWithClient) => {
    setAttendances((prev) => [newAtt, ...prev]);
    setIsModalOpen(false);
    setToastMessage(
      isEn
        ? `Attendance for "${newAtt.clientName}" registered successfully!`
        : `Atendimento de "${newAtt.clientName}" registrado com sucesso!`
    );
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleToggleDocStatus = (attendanceId: string, docId: string) => {
    setAttendances((prev) =>
      prev.map((att) => {
        if (att.id !== attendanceId) return att;
        const updatedDocs = (att.pendingDocuments || []).map((doc) =>
          doc.id === docId ? { ...doc, isDelivered: !doc.isDelivered } : doc
        );
        return { ...att, pendingDocuments: updatedDocs };
      })
    );
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterType('ALL');
  };

  // Filtered attendances
  const filteredAttendances = useMemo(() => {
    const cleanTerm = debouncedSearchTerm.replace(/\D/g, '');
    return attendances.filter((att) => {
      const matchesSearch =
        att.clientName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (cleanTerm.length > 0 && att.clientCpf.includes(cleanTerm)) ||
        att.objective.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (att.attendantName || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (filterType === 'RETURN_DOCUMENTS') {
        return att.attendanceType === 'RETURN_DOCUMENTS' || att.attendanceType === 'RETURN';
      }
      if (filterType === 'FIRST_CONSULTATION') {
        return att.attendanceType === 'FIRST_CONSULTATION' || att.attendanceType === 'FIRST_VISIT';
      }
      if (filterType === 'CONTRACT_SIGNING') {
        return att.attendanceType === 'CONTRACT_SIGNING';
      }
      return true;
    });
  }, [attendances, debouncedSearchTerm, filterType]);

  if (!canAccess('receptionDesk')) {
    return (
      <AccessDeniedBoundary
        moduleName={isEn ? 'Reception & Attendance Queue' : 'Recepção & Fila de Atendimentos'}
        requiredPermissionLabel={isEn ? 'Reception & Triage (receptionDesk)' : 'Recepção e Triagem (receptionDesk)'}
      />
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner with Dual-View Switcher & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0B192E] via-[#10233f] to-[#142642] text-white p-6 rounded-2xl shadow-xs border border-white/10">
        <div>
          <div className="flex items-center gap-2 text-[#C89543] font-semibold text-xs tracking-wider uppercase mb-1">
            <FileText className="w-4 h-4" />
            <span>{isEn ? 'Operational Attendance Hub' : 'Central Operacional de Atendimentos'}</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {isEn ? 'In-Person Attendances & Client Returns' : 'Atendimentos e Retornos Presenciais'}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            {isEn
              ? 'Complete history of consultations, client narratives, physical document intake, and legal guidance provided by the firm.'
              : 'Histórico completo de atendimentos, relatos de fatos dos segurados, entregas de documentos físicos e orientações jurídicas prestadas pela banca.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Switcher Controls */}
          <div className="flex items-center gap-1.5 bg-black/30 p-1.5 rounded-xl border border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-[#C89543] text-white shadow-xs'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <LayoutList className="w-4 h-4" />
              <span>{isEn ? 'Operational Table' : 'Tabela Operacional'}</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'timeline'
                  ? 'bg-[#C89543] text-white shadow-xs'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <GitCommit className="w-4 h-4" />
              <span>{isEn ? 'Timeline' : 'Linha do Tempo'}</span>
            </button>
          </div>

          {/* New Attendance Button */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#C89543] hover:bg-[#d6a452] text-white shadow-md transition-all active:scale-95 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isEn ? 'Register Attendance' : 'Registrar Atendimento'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row (Interactive 1-Click Filter Cards) */}
      <AttendancesMetricsRow
        attendances={attendances}
        filterType={filterType}
        onSelectFilter={setFilterType}
        locale={locale}
      />

      {/* Filter and Search Bar */}
      <AttendancesSearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        totalAttendances={attendances.length}
        locale={locale}
      />

      {/* VIEW 1: TABULAR OPERATIONAL VIEW */}
      {viewMode === 'table' && (
        <AttendancesTableView
          attendances={filteredAttendances}
          loading={loading}
          searchTerm={searchTerm}
          filterType={filterType}
          onClearFilters={handleClearFilters}
          locale={locale}
        />
      )}

      {/* VIEW 2: CHRONOLOGICAL TIMELINE VIEW */}
      {viewMode === 'timeline' && (
        <AttendancesTimelineView
          attendances={filteredAttendances}
          searchTerm={searchTerm}
          filterType={filterType}
          onClearFilters={handleClearFilters}
          onToggleDocStatus={handleToggleDocStatus}
          locale={locale}
        />
      )}

      {/* New General Attendance Modal */}
      <NewGeneralAttendanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAttendance}
      />
    </div>
  );
}
