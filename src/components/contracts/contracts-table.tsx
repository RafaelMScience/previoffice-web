'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  FolderLock,
  Printer,
  FileCheck2,
  Paperclip,
  CreditCard,
  ExternalLink,
  AlertCircle,
  Clock,
  Sparkles,
  Filter,
  CheckCircle2,
  FileText,
  Check,
} from 'lucide-react';
import type { Contract } from '@/types/contract';
import { useI18n } from '@/lib/i18n/i18n-context';
import { formatBenefitType } from '@/lib/utils/benefit-translations';
import { useDebounce } from '@/hooks/use-debounce';

export type ContractFilterTab = 'ALL' | 'ACTIVE' | 'INSTALLMENTS' | 'PENDING_SIGNATURE' | 'CONCLUDED';

interface ContractsTableProps {
  contracts: Contract[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeFilter: ContractFilterTab;
  onFilterChange: (tab: ContractFilterTab) => void;
  onOpenInstallments: (contract: Contract) => void;
  onOpenPrint: (contract: Contract) => void;
  onOpenUpload: (contract: Contract) => void;
}

export function ContractsTable({
  contracts,
  searchTerm,
  onSearchChange,
  activeFilter,
  onFilterChange,
  onOpenInstallments,
  onOpenPrint,
  onOpenUpload,
}: ContractsTableProps) {
  const { t } = useI18n();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const isContractSettled = (contract: Contract) => {
    if (contract.feeStructure.isSettled) return true;
    if (contract.status === 'CONCLUDED') return true;
    const installments = contract.feeStructure.installments || [];
    if (installments.length > 0 && installments.every((i) => i.status === 'PAID')) {
      return true;
    }
    return false;
  };

  const counts = useMemo(() => {
    return {
      ALL: contracts.length,
      ACTIVE: contracts.filter((c) => c.status === 'ACTIVE').length,
      INSTALLMENTS: contracts.filter((c) => {
        const hasInst = (c.feeStructure.installments || []).length > 0;
        return hasInst && !isContractSettled(c);
      }).length,
      PENDING_SIGNATURE: contracts.filter(
        (c) => c.status === 'PENDING_SIGNATURE' || c.physicalSignedStatus === 'PENDING'
      ).length,
      CONCLUDED: contracts.filter((c) => isContractSettled(c) || c.status === 'CONCLUDED').length,
    };
  }, [contracts]);

  const filteredContracts = useMemo(() => {
    return contracts.filter((contract) => {
      const settled = isContractSettled(contract);

      // Tab filter
      if (activeFilter === 'ACTIVE' && contract.status !== 'ACTIVE') return false;
      if (activeFilter === 'INSTALLMENTS') {
        const hasInst = (contract.feeStructure.installments || []).length > 0;
        if (!hasInst || settled) return false;
      }
      if (
        activeFilter === 'PENDING_SIGNATURE' &&
        !(contract.status === 'PENDING_SIGNATURE' || contract.physicalSignedStatus === 'PENDING')
      )
        return false;
      if (activeFilter === 'CONCLUDED' && !settled && contract.status !== 'CONCLUDED') return false;

      // Text search (debounced to avoid heavy filtering passes on rapid typing)
      if (!debouncedSearchTerm.trim()) return true;
      const term = debouncedSearchTerm.toLowerCase();
      const cleanDigits = term.replace(/\D/g, '');
      const matchNumber = contract.contractNumber.toLowerCase().includes(term);
      const matchClient = contract.clientName.toLowerCase().includes(term);
      const matchCpf = cleanDigits.length > 0 && contract.clientCpf.replace(/\D/g, '').includes(cleanDigits);
      const matchBenefit = contract.benefitSpecies.toLowerCase().includes(term);
      const matchLocation = contract.physicalFileLocation?.toLowerCase().includes(term);

      return matchNumber || matchClient || matchCpf || matchBenefit || matchLocation;
    });
  }, [contracts, activeFilter, debouncedSearchTerm]);

  const formatBRL = (val?: number) => {
    if (val === undefined || isNaN(val)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
      {/* Top Controls: Filter Tabs & Search Bar */}
      <div className="p-4 border-b border-slate-200/80 bg-slate-50/70 space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Tab Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-200/70 rounded-lg w-fit">
            <button
              type="button"
              onClick={() => onFilterChange('ALL')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeFilter === 'ALL'
                  ? 'bg-white text-[#16324F] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.contracts.tabFilterAll}</span>
              <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 text-[10px] rounded-full font-mono">
                {counts.ALL}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onFilterChange('ACTIVE')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeFilter === 'ACTIVE'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.contracts.tabFilterActive}</span>
              <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 text-[10px] rounded-full font-mono">
                {counts.ACTIVE}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onFilterChange('INSTALLMENTS')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeFilter === 'INSTALLMENTS'
                  ? 'bg-white text-[#0B78D0] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-[#0B78D0]" />
              <span>{t.contracts.tabFilterInstallments}</span>
              <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 text-[10px] rounded-full font-mono">
                {counts.INSTALLMENTS}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onFilterChange('PENDING_SIGNATURE')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeFilter === 'PENDING_SIGNATURE'
                  ? 'bg-white text-amber-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.contracts.tabFilterPendingSignature}</span>
              <span className="px-1.5 py-0.2 bg-amber-50 text-amber-700 text-[10px] rounded-full font-mono">
                {counts.PENDING_SIGNATURE}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onFilterChange('CONCLUDED')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeFilter === 'CONCLUDED'
                  ? 'bg-white text-purple-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>{t.contracts.tabFilterConcluded}</span>
              <span className="px-1.5 py-0.2 bg-purple-50 text-purple-700 text-[10px] rounded-full font-mono">
                {counts.CONCLUDED}
              </span>
            </button>
          </div>

          {/* Quick Counter Info */}
          <div className="text-xs text-slate-500 font-medium self-end lg:self-center">
            Exibindo <span className="font-bold text-[#16324F]">{filteredContracts.length}</span> de{' '}
            <span className="font-bold text-slate-700">{contracts.length}</span> contratos
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Pesquisar por número do contrato (ex: CTR-2026-081), nome do cliente, CPF, benefício ou pasta no arquivo..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B78D0]/30 focus:border-[#0B78D0] transition-all shadow-inner"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-medium px-1.5 py-0.5 rounded bg-slate-100"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">{t.contracts.colContractNumber}</th>
              <th className="py-3 px-4">{t.contracts.colClient}</th>
              <th className="py-3 px-4">{t.contracts.colBenefit}</th>
              <th className="py-3 px-4">{t.contracts.colFeeStructure}</th>
              <th className="py-3 px-4">Financeiro & Parcelas</th>
              <th className="py-3 px-4">{t.contracts.colSignatureStatus}</th>
              <th className="py-3 px-4 text-right">{t.contracts.colActions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredContracts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 bg-white">
                  <div className="max-w-xs mx-auto space-y-2">
                    <Filter className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-semibold text-slate-700 text-sm">Nenhum contrato encontrado</p>
                    <p className="text-xs text-slate-500">
                      Tente alterar os filtros ou o termo de pesquisa acima.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredContracts.map((contract) => {
                const isInstallmentModel = contract.feeStructure.installments.length > 0;
                const paidInstallments = contract.feeStructure.installments.filter((i) => i.status === 'PAID');
                const totalInstallments = contract.feeStructure.installments.length;
                const paidSum = paidInstallments.reduce((acc, i) => acc + i.amount, 0);
                const isPhysicallySigned = contract.physicalSignedStatus === 'ATTACHED';

                // Check if all installments are fully settled
                const isAllPaid =
                  (isInstallmentModel && paidInstallments.length === totalInstallments && totalInstallments > 0) ||
                  Boolean(contract.feeStructure.isSettled);

                return (
                  <tr
                    key={contract.id}
                    className="hover:bg-slate-50/80 transition-colors group text-slate-700"
                  >
                    {/* Contract Number & Issue */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="space-y-1">
                        <div className="font-mono font-bold text-xs text-[#082A52] tracking-tight">
                          {contract.contractNumber}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <span>Emitido: {formatDate(contract.createdAt)}</span>
                        </div>
                        {contract.physicalFileLocation && (
                          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200/70 text-[10px] font-mono text-amber-900 max-w-[180px] truncate">
                            <FolderLock className="w-2.5 h-2.5 text-amber-700 shrink-0" />
                            <span className="truncate">{contract.physicalFileLocation}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Client & CPF */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="space-y-0.5">
                        <Link
                          href={`/clientes/${contract.clientId}`}
                          className="font-bold text-sm text-[#082A52] hover:text-[#0B78D0] hover:underline flex items-center gap-1.5 group/link"
                        >
                          <span>{contract.clientName}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity text-slate-400" />
                        </Link>
                        <div className="text-[11px] font-mono text-slate-500">
                          CPF: {contract.clientCpf}
                        </div>
                        {contract.clientPhone && (
                          <div className="text-[10px] text-slate-400">
                            Tel: {contract.clientPhone}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Benefit Species */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="space-y-1">
                        <span className="font-medium text-slate-900 block leading-tight">
                          {formatBenefitType(contract.benefitSpecies, 'pt-BR')}
                        </span>
                        {contract.templateTitle && (
                          <span className="text-[11px] text-slate-500 line-clamp-1">
                            {contract.templateTitle}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Fee Structure */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="space-y-1.5">
                        {contract.feeStructure.feeModel === 'QUOTA_LITIS' && (
                          <div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                              Quota Litis {contract.feeStructure.quotaLitisPercentage || 30}%
                            </span>
                            <div className="text-[10px] text-slate-500 mt-1">
                              Êxito est.:{' '}
                              <strong className="text-emerald-700">
                                {formatBRL(contract.feeStructure.estimatedSuccessFeeAmount)}
                              </strong>
                            </div>
                          </div>
                        )}

                        {contract.feeStructure.feeModel === 'FIXED_INSTALLMENT' && (
                          <div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                              Parcelado Fixo
                            </span>
                            <div className="text-[10px] text-slate-500 mt-1">
                              Total:{' '}
                              <strong className="text-slate-900">
                                {formatBRL(contract.feeStructure.fixedTotalAmount)}
                              </strong>
                            </div>
                          </div>
                        )}

                        {contract.feeStructure.feeModel === 'HYBRID' && (
                          <div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
                              Híbrido ({contract.feeStructure.quotaLitisPercentage}% + Entrada)
                            </span>
                            <div className="text-[10px] text-slate-500 mt-1">
                              Fixo {formatBRL(contract.feeStructure.fixedTotalAmount)} + Êxito
                            </div>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Financial Status & Installment Tracking */}
                    <td className="py-3.5 px-4 align-top">
                      {isAllPaid ? (
                        <div className="space-y-1 max-w-[210px] p-2 bg-emerald-50/70 border border-emerald-200/80 rounded-lg">
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-600 text-white shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>PAGO E LIQUIDADO</span>
                          </div>
                          <div className="text-[11px] text-emerald-950 font-bold flex items-center justify-between pt-0.5">
                            <span>100% das Parcelas</span>
                            <span className="font-mono">{formatBRL(paidSum)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-emerald-800 font-medium">
                            <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>Dívida finalizada • Sem saldo</span>
                          </div>
                        </div>
                      ) : isInstallmentModel ? (
                        <div className="space-y-1.5 max-w-[190px]">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-slate-700">
                              {paidInstallments.length}/{totalInstallments} pagas
                            </span>
                            <span className="font-mono text-[10px] text-emerald-700 font-bold">
                              {Math.round((paidInstallments.length / totalInstallments) * 100)}%
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.round((paidInstallments.length / totalInstallments) * 100)}%`,
                              }}
                            />
                          </div>

                          <div className="text-[10px] text-slate-500 flex justify-between">
                            <span>Recebido: {formatBRL(paidSum)}</span>
                            <span className="text-amber-800 font-medium">
                              Resta:{' '}
                              {formatBRL(
                                (contract.feeStructure.fixedTotalAmount || 0) - paidSum > 0
                                  ? (contract.feeStructure.fixedTotalAmount || 0) - paidSum
                                  : 0
                              )}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                            <Clock className="w-3 h-3 text-slate-400" />
                            Aguardando Êxito / RPV
                          </span>
                          <div className="text-[10px] text-slate-500">
                            Base: {formatBRL(contract.feeStructure.estimatedRetroactiveAmount)}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Signature Status & Physical File Location */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="space-y-1.5">
                        {isPhysicallySigned || contract.physicalAttachment?.isSigned ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              ✓ Assinado (PDF Arquivado)
                            </span>
                            {contract.physicalAttachment?.replacedBy && (
                              <div className="text-[9px] text-emerald-700 font-medium truncate max-w-[150px]">
                                Vinculado por: {contract.physicalAttachment.replacedBy}
                              </div>
                            )}
                            {contract.physicalFileLocation && (
                              <div className="text-[10px] text-slate-500 font-mono leading-tight truncate max-w-[150px]">
                                {contract.physicalFileLocation}
                              </div>
                            )}
                          </div>
                        ) : (contract.customContractAttachment || contract.customPoaAttachment || (contract.physicalAttachment && !contract.physicalAttachment.isSigned)) ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-700" />
                              Pendente Assinatura (Minuta Própria)
                            </span>
                            <div className="text-[10px] text-slate-500">
                              PDF próprio enviado • Aguardando via assinada
                            </div>
                            {contract.physicalFileLocation && (
                              <div className="text-[10px] text-slate-400 font-mono leading-tight truncate max-w-[150px]">
                                {contract.physicalFileLocation}
                              </div>
                            )}
                          </div>
                        ) : contract.physicalSignedStatus === 'NOT_APPLICABLE' ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                              <FileCheck2 className="w-3 h-3 text-blue-700" />
                              Assinado Digital
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                              <AlertCircle className="w-3 h-3 text-amber-700" />
                              Pendente Assinatura
                            </span>
                            <div className="text-[10px] text-slate-400">
                              Sem via física arquivada
                            </div>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 align-top text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Installments Ledger Button */}
                        <button
                          type="button"
                          onClick={() => onOpenInstallments(contract)}
                          title={t.contracts.actionViewInstallments}
                          className="p-1.5 text-slate-600 hover:text-[#0B78D0] hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-md transition-all"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>

                        {/* Print Contract & POA Button */}
                        <button
                          type="button"
                          onClick={() => onOpenPrint(contract)}
                          title={t.contracts.actionPrintA4}
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 rounded-md transition-all"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Upload Scanned Signed Contract Button */}
                        <button
                          type="button"
                          onClick={() => onOpenUpload(contract)}
                          title={t.contracts.actionUploadSigned}
                          className={`p-1.5 rounded-md border transition-all ${
                            isPhysicallySigned
                              ? 'text-emerald-700 hover:bg-emerald-50 border-emerald-200'
                              : 'text-amber-700 hover:bg-amber-50 border-amber-200 bg-amber-50/50'
                          }`}
                        >
                          <Paperclip className="w-4 h-4" />
                        </button>

                        {/* Client Workbench Link */}
                        <Link
                          href={`/clientes/${contract.clientId}`}
                          title={t.contracts.actionClientProfile}
                          className="p-1.5 text-slate-600 hover:text-[#082A52] hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-md transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer stats */}
      <div className="p-3 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div>
          Banca Previdenciária • Honorários e Contratos em conformidade com o Estatuto da OAB (Lei 8.906/94)
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>
            Modelos de cobrança:{' '}
            <strong className="text-slate-700">Quota Litis (Êxito) / Carnê / Híbrido</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
