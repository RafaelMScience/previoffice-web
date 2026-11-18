'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Clock,
  Calendar,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  UserCheck,
  Building,
  PlusCircle,
  LayoutList,
  GitCommit,
  ShieldCheck,
  FileCheck2,
  X,
  FilterX,
} from 'lucide-react';
import { getAllAttendancesWithClient, type AttendanceWithClient } from '@/lib/data/mock-clients';
import { useI18n } from '@/lib/i18n/i18n-context';
import { formatCpf } from '@/lib/domain/cpf-validator';
import type { AttendanceType } from '@/types/attendance';
import { NewGeneralAttendanceModal } from '@/components/attendances/new-general-attendance-modal';

export default function AttendancesPage() {
  const { t } = useI18n();
  const router = useRouter();

  const [attendances, setAttendances] = useState<AttendanceWithClient[]>(() =>
    getAllAttendancesWithClient()
  );
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<
    'ALL' | 'RETURN_DOCUMENTS' | 'FIRST_CONSULTATION' | 'CONTRACT_SIGNING'
  >('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSaveAttendance = (newAtt: AttendanceWithClient) => {
    setAttendances((prev) => [newAtt, ...prev]);
    setIsModalOpen(false);
    setToastMessage(`Atendimento de "${newAtt.clientName}" registrado com sucesso!`);
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
    return attendances.filter((att) => {
      const matchesSearch =
        att.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        att.clientCpf.includes(searchTerm.replace(/\D/g, '')) ||
        att.objective.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (att.attendantName || '').toLowerCase().includes(searchTerm.toLowerCase());

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
  }, [attendances, searchTerm, filterType]);

  const getAttendanceTypeBadge = (type: AttendanceType) => {
    switch (type) {
      case 'FIRST_CONSULTATION':
      case 'FIRST_VISIT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            1ª Consulta / Triagem
          </span>
        );
      case 'RETURN_DOCUMENTS':
      case 'RETURN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            Retorno c/ Documentos
          </span>
        );
      case 'CONTRACT_SIGNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Assinatura de Contrato OAB
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            Orientação Geral
          </span>
        );
    }
  };

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
            <span>Central Operacional de Atendimentos</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Atendimentos e Retornos Presenciais
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Histórico completo de atendimentos, relatos de fatos dos segurados, entregas de documentos físicos e orientações jurídicas prestadas pela banca.
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
              <span>Tabela Operacional</span>
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
              <span>Linha do Tempo</span>
            </button>
          </div>

          {/* New Attendance Button */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#C89543] hover:bg-[#d6a452] text-white shadow-md transition-all active:scale-95 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Atendimento</span>
          </button>
        </div>
      </div>

      {/* Metrics Row (Interactive 1-Click Filter Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setFilterType('ALL')}
          className={`p-5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            filterType === 'ALL'
              ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-[#C89543] shadow-md'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm text-slate-800'
          }`}
          title="Clique para filtrar: Todos os atendimentos"
        >
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider ${filterType === 'ALL' ? 'text-slate-300' : 'text-slate-500'}`}>
              Total de Atendimentos
            </p>
            <h3 className={`text-2xl font-bold mt-1 ${filterType === 'ALL' ? 'text-white' : 'text-slate-900'}`}>
              {attendances.length}
            </h3>
            <span className={`text-xs font-medium flex items-center gap-1 mt-1 ${filterType === 'ALL' ? 'text-[#C89543]' : 'text-slate-500'}`}>
              {filterType === 'ALL' ? '● Filtro ativo' : 'Histórico consolidado'}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${filterType === 'ALL' ? 'bg-white/10 text-[#C89543]' : 'bg-blue-50 text-blue-600'}`}>
            <Users className="w-6 h-6" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setFilterType('RETURN_DOCUMENTS')}
          className={`p-5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            filterType === 'RETURN_DOCUMENTS'
              ? 'bg-amber-900 text-white border-amber-900 ring-2 ring-[#C89543] shadow-md'
              : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-sm text-slate-800'
          }`}
          title="Clique para filtrar: Retornos com Documentos"
        >
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider ${filterType === 'RETURN_DOCUMENTS' ? 'text-amber-200' : 'text-slate-500'}`}>
              Retornos com Documentos
            </p>
            <h3 className={`text-2xl font-bold mt-1 ${filterType === 'RETURN_DOCUMENTS' ? 'text-white' : 'text-amber-600'}`}>
              {attendances.filter((a) => a.attendanceType === 'RETURN_DOCUMENTS' || a.attendanceType === 'RETURN').length}
            </h3>
            <span className={`text-xs font-medium flex items-center gap-1 mt-1 ${filterType === 'RETURN_DOCUMENTS' ? 'text-[#C89543]' : 'text-amber-600'}`}>
              {filterType === 'RETURN_DOCUMENTS' ? '● Filtro ativo' : 'Instrução probatória'}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${filterType === 'RETURN_DOCUMENTS' ? 'bg-white/10 text-amber-200' : 'bg-amber-50 text-amber-600'}`}>
            <Clock className="w-6 h-6" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setFilterType('FIRST_CONSULTATION')}
          className={`p-5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            filterType === 'FIRST_CONSULTATION'
              ? 'bg-blue-950 text-white border-blue-950 ring-2 ring-[#C89543] shadow-md'
              : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm text-slate-800'
          }`}
          title="Clique para filtrar: 1ªs Consultas / Triagens"
        >
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider ${filterType === 'FIRST_CONSULTATION' ? 'text-blue-200' : 'text-slate-500'}`}>
              1ªs Consultas / Triagens
            </p>
            <h3 className={`text-2xl font-bold mt-1 ${filterType === 'FIRST_CONSULTATION' ? 'text-white' : 'text-blue-600'}`}>
              {attendances.filter((a) => a.attendanceType === 'FIRST_CONSULTATION' || a.attendanceType === 'FIRST_VISIT').length}
            </h3>
            <span className={`text-xs font-medium flex items-center gap-1 mt-1 ${filterType === 'FIRST_CONSULTATION' ? 'text-[#C89543]' : 'text-slate-500'}`}>
              {filterType === 'FIRST_CONSULTATION' ? '● Filtro ativo' : 'Novos clientes captados'}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${filterType === 'FIRST_CONSULTATION' ? 'bg-white/10 text-blue-200' : 'bg-slate-50 text-slate-700'}`}>
            <UserCheck className="w-6 h-6" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setFilterType('CONTRACT_SIGNING')}
          className={`p-5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            filterType === 'CONTRACT_SIGNING'
              ? 'bg-emerald-950 text-white border-emerald-950 ring-2 ring-[#C89543] shadow-md'
              : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-sm text-slate-800'
          }`}
          title="Clique para filtrar: Contratos Formalizados"
        >
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider ${filterType === 'CONTRACT_SIGNING' ? 'text-emerald-200' : 'text-slate-500'}`}>
              Contratos Formalizados
            </p>
            <h3 className={`text-2xl font-bold mt-1 ${filterType === 'CONTRACT_SIGNING' ? 'text-white' : 'text-emerald-600'}`}>
              {attendances.filter((a) => a.attendanceType === 'CONTRACT_SIGNING').length}
            </h3>
            <span className={`text-xs font-medium flex items-center gap-1 mt-1 ${filterType === 'CONTRACT_SIGNING' ? 'text-[#C89543]' : 'text-emerald-600'}`}>
              {filterType === 'CONTRACT_SIGNING' ? '● Filtro ativo' : 'Procuração OAB emitida'}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${filterType === 'CONTRACT_SIGNING' ? 'bg-white/10 text-emerald-200' : 'bg-emerald-50 text-emerald-600'}`}>
            <FileCheck2 className="w-6 h-6" />
          </div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, CPF, objetivo..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89543] focus:bg-white text-slate-900"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
              title="Limpar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          <button
            type="button"
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterType === 'ALL'
                ? 'bg-[#0B192E] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({attendances.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('RETURN_DOCUMENTS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterType === 'RETURN_DOCUMENTS'
                ? 'bg-[#0B192E] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Retornos com Documentos
          </button>
          <button
            type="button"
            onClick={() => setFilterType('FIRST_CONSULTATION')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterType === 'FIRST_CONSULTATION'
                ? 'bg-[#0B192E] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            1ª Consulta
          </button>
          <button
            type="button"
            onClick={() => setFilterType('CONTRACT_SIGNING')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterType === 'CONTRACT_SIGNING'
                ? 'bg-[#0B192E] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Contrato Fechado
          </button>
        </div>
      </div>

      {/* VIEW 1: TABULAR OPERATIONAL VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-5 py-3.5">Cliente</th>
                  <th scope="col" className="px-5 py-3.5">Tipo de Atendimento</th>
                  <th scope="col" className="px-5 py-3.5">Objetivo / Benefício</th>
                  <th scope="col" className="px-5 py-3.5">Data / Hora</th>
                  <th scope="col" className="px-5 py-3.5">Atendente</th>
                  <th scope="col" className="px-5 py-3.5">Pendências</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttendances.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                      <div className="max-w-xs mx-auto space-y-3">
                        <p className="text-sm">Nenhum atendimento localizado com os filtros selecionados.</p>
                        {(searchTerm || filterType !== 'ALL') && (
                          <button
                            type="button"
                            onClick={handleClearFilters}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#0B192E] bg-slate-100 hover:bg-slate-200 transition-colors"
                          >
                            <FilterX className="w-3.5 h-3.5" />
                            <span>Limpar Filtros</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAttendances.map((att) => {
                    const pendingCount = (att.pendingDocuments || []).filter((d) => !d.isDelivered).length;

                    return (
                      <tr
                        key={att.id}
                        onClick={() => router.push(`/clientes/${att.clientId}`)}
                        className="hover:bg-amber-50/40 transition-colors group cursor-pointer"
                      >
                        {/* Client Info */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#0B192E] text-[#C89543] flex items-center justify-center font-bold text-xs shrink-0">
                              {att.clientName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-900 group-hover:text-[#C89543] transition-colors block">
                                {att.clientName}
                              </span>
                              <span className="text-xs text-slate-500 font-mono">
                                CPF: {formatCpf(att.clientCpf)}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Type Badge */}
                        <td className="px-5 py-4">
                          {getAttendanceTypeBadge(att.attendanceType)}
                        </td>

                        {/* Objective */}
                        <td className="px-5 py-4">
                          <span className="text-xs font-semibold text-slate-800 line-clamp-1">
                            {att.objective}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4">
                          <span className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(att.attendedAt).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(att.attendedAt).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </td>

                        {/* Attendant */}
                        <td className="px-5 py-4">
                          <span className="text-xs text-slate-600 flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                            {att.attendantName || 'Dr. Alexandre Pontes'}
                          </span>
                        </td>

                        {/* Pending Docs */}
                        <td className="px-5 py-4">
                          {pendingCount > 0 ? (
                            <div className="flex flex-col gap-0.5 items-start">
                              <span
                                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 cursor-help"
                                title={`Documentos pendentes:\n${(att.pendingDocuments || [])
                                  .filter((d) => !d.isDelivered)
                                  .map((d) => `• ${d.description}`)
                                  .join('\n')}`}
                              >
                                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>{pendingCount} pendente(s)</span>
                              </span>
                              <span
                                className="text-[11px] text-slate-500 line-clamp-1 max-w-[210px]"
                                title={(att.pendingDocuments || [])
                                  .filter((d) => !d.isDelivered)
                                  .map((d) => d.description)
                                  .join(', ')}
                              >
                                {(att.pendingDocuments || [])
                                  .filter((d) => !d.isDelivered)
                                  .map((d) => d.description)
                                  .join(', ')}
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Completo</span>
                            </span>
                          )}
                        </td>

                        {/* Action Link */}
                        <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <Link
                            href={`/clientes/${att.clientId}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0B192E] hover:bg-[#142642] group-hover:bg-[#C89543] transition-colors shadow-2xs"
                            title="Abrir Mesa do Advogado deste cliente"
                          >
                            <span>Atender</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: CHRONOLOGICAL TIMELINE VIEW */}
      {viewMode === 'timeline' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
          <div className="pb-4 mb-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Linha do Tempo Cronológica de Atendimentos
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Visão aprofundada dos fatos narrados, evolução probatória e decisões tomadas em cada consulta.
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              {filteredAttendances.length} registro(s)
            </span>
          </div>

          {filteredAttendances.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <p className="text-sm">Nenhum atendimento localizado na linha do tempo com os filtros selecionados.</p>
              {(searchTerm || filterType !== 'ALL') && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#0B192E] bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <FilterX className="w-3.5 h-3.5" />
                  <span>Limpar Filtros</span>
                </button>
              )}
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {filteredAttendances.map((att, idx) => {
                const isFirst = idx === 0;

                return (
                  <div key={att.id} className="relative group">
                    {/* Timeline Dot */}
                    <div
                      className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isFirst
                          ? 'bg-[#C89543] border-[#0B192E] text-white shadow-xs'
                          : 'bg-white border-slate-300 text-slate-500'
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isFirst ? 'bg-white' : 'bg-slate-400'
                        }`}
                      />
                    </div>

                    {/* Card Content */}
                    <div className="bg-slate-50/70 hover:bg-slate-50 p-5 rounded-xl border border-slate-200 transition-colors space-y-3">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          {getAttendanceTypeBadge(att.attendanceType)}
                          <Link
                            href={`/clientes/${att.clientId}`}
                            className="font-bold text-sm text-[#0B192E] hover:text-[#C89543] transition-colors"
                          >
                            {att.clientName}
                          </Link>
                          <span className="text-xs text-slate-500 font-mono">
                            CPF: {formatCpf(att.clientCpf)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {new Date(att.attendedAt).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(att.attendedAt).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Objective */}
                      <div className="text-xs font-semibold text-slate-800">
                        <span className="text-slate-500 font-normal">Objetivo: </span>
                        {att.objective}
                      </div>

                      {/* Narrative History */}
                      {att.narrativeHistory && (
                        <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200/80 leading-relaxed">
                          <span className="block font-bold text-slate-900 mb-1">
                            Relato do Cliente:
                          </span>
                          <p className="whitespace-pre-line">{att.narrativeHistory}</p>
                        </div>
                      )}

                      {/* Legal Strategy */}
                      {att.notes && (
                        <div className="text-xs text-amber-900 bg-amber-50/60 p-3 rounded-lg border border-amber-200/60 leading-relaxed">
                          <span className="block font-bold text-amber-950 mb-1">
                            Estratégia e Orientação Jurídica:
                          </span>
                          <p>{att.notes}</p>
                        </div>
                      )}

                      {/* Pending Documents Checklist */}
                      {att.pendingDocuments && att.pendingDocuments.length > 0 && (
                        <div className="pt-1">
                          <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Documentos Vinculados (clique para alternar status):
                          </span>
                          <div className="space-y-1.5">
                            {att.pendingDocuments.map((doc) => (
                              <button
                                key={doc.id}
                                type="button"
                                onClick={() => handleToggleDocStatus(att.id, doc.id)}
                                className="flex items-center gap-2 text-xs text-slate-700 hover:text-slate-900 group/doc text-left w-full py-1 px-1.5 -mx-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
                                title={
                                  doc.isDelivered
                                    ? 'Documento entregue. Clique para desmarcar.'
                                    : 'Documento pendente. Clique para marcar como recebido.'
                                }
                              >
                                <span
                                  className={`w-4 h-4 rounded-sm border flex items-center justify-center font-bold text-[9px] transition-colors shrink-0 ${
                                    doc.isDelivered
                                      ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                                      : 'bg-white border-slate-300 text-transparent group-hover/doc:border-[#C89543]'
                                  }`}
                                >
                                  {doc.isDelivered ? '✓' : ''}
                                </span>
                                <span
                                  className={`flex-1 ${
                                    doc.isDelivered ? 'line-through text-slate-400' : 'text-slate-800'
                                  }`}
                                >
                                  {doc.description}
                                </span>
                                {doc.isDelivered && (
                                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                                    Entregue
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Card Footer */}
                      <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200/60">
                        <span className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span>Atendente: {att.attendantName || 'Dr. Alexandre Pontes'}</span>
                        </span>

                        <Link
                          href={`/clientes/${att.clientId}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0B192E] hover:bg-[#142642] hover:text-[#C89543] transition-colors shadow-2xs"
                        >
                          <span>Abrir Mesa do Advogado</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
