'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Receipt,
  Scale,
  Banknote,
  Sparkles,
  Check,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { formatBenefitType } from '@/lib/utils/benefit-translations';
import { formatPaymentMethod } from '@/lib/utils/template-engine';
import type {
  Contract,
  FeeInstallment,
  PaymentMethod,
} from '@/types/contract';

interface InstallmentsDrawerModalProps {
  contract: Contract | null;
  isOpen: boolean;
  onClose: () => void;
  onSettleInstallment: (
    contractId: string,
    installmentId: string,
    paymentMethod: PaymentMethod,
    receiptReference?: string,
    notes?: string
  ) => void;
}

export function InstallmentsDrawerModal({
  contract,
  isOpen,
  onClose,
  onSettleInstallment,
}: InstallmentsDrawerModalProps) {
  const { t } = useI18n();

  const [selectedInstallment, setSelectedInstallment] = useState<FeeInstallment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  const [receiptRef, setReceiptRef] = useState('');
  const [settleNotes, setSettleNotes] = useState('');

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !contract) return null;

  const formatBrl = (val?: number) => {
    if (val === undefined || isNaN(val)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const formatDate = (isoDate?: string) => {
    if (!isoDate) return '—';
    const parts = isoDate.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return new Date(isoDate).toLocaleDateString('pt-BR');
  };

  const formatCpf = (cpf: string) => {
    const digits = cpf.replace(/\D/g, '');
    if (digits.length === 11) {
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    }
    return cpf;
  };

  const { feeStructure } = contract;
  const installments = feeStructure.installments || [];

  const paidInstallments = installments.filter((i) => i.status === 'PAID');
  const openInstallments = installments.filter((i) => i.status === 'PENDING' || i.status === 'OVERDUE');

  const totalPaid = paidInstallments.reduce((acc, curr) => acc + curr.amount, 0);
  const totalOpen = openInstallments.reduce((acc, curr) => acc + curr.amount, 0);
  const totalFixed = feeStructure.fixedTotalAmount || totalPaid + totalOpen;
  const progressPercent = totalFixed > 0 ? (totalPaid / totalFixed) * 100 : 0;
  const isFullySettled = installments.length > 0 && totalOpen === 0;

  const handleConfirmSettle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstallment) return;
    onSettleInstallment(
      contract.id,
      selectedInstallment.id,
      paymentMethod,
      receiptRef || undefined,
      settleNotes || undefined
    );
    setSelectedInstallment(null);
    setReceiptRef('');
    setSettleNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="installments-drawer-title"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-[#0B192E] text-white p-5 relative shrink-0 border-b border-white/10">
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="absolute top-4 right-4 text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-[#C89543] font-semibold text-xs tracking-wider uppercase mb-1">
            <CreditCard className="w-4 h-4" />
            <span>{t.contracts.modalInstallmentsTitle}</span>
          </div>

          <h2 id="installments-drawer-title" className="text-xl font-bold tracking-tight">
            {contract.contractNumber} — {contract.clientName}
          </h2>

          <div className="flex items-center gap-4 text-xs text-slate-300 mt-1 flex-wrap">
            <span>
              <strong>CPF:</strong> {formatCpf(contract.clientCpf)}
            </span>
            <span>•</span>
            <span>
              <strong>Objeto:</strong> {formatBenefitType(contract.benefitSpecies, 'pt-BR')}
            </span>
            <span>•</span>
            <span>
              <strong>Pasta:</strong> {contract.physicalFileLocation}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Fully Settled Celebration Banner */}
          {isFullySettled && (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4 flex items-center gap-3.5 shadow-2xs">
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl shrink-0 shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-emerald-950 uppercase tracking-tight">
                    Honorários 100% Quitados — Dívida Liquidada
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900 font-mono">
                    Saldo R$ 0,00
                  </span>
                </div>
                <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                  Todas as {installments.length} parcelas foram pagas e baixadas no livro caixa. Não há nenhum valor ou parcela em aberto para este cliente.
                </p>
              </div>
            </div>
          )}

          {/* Overview Cards Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Success Fee / Quota Litis Box */}
            <div className="bg-[#F8FAFC] border border-[#D8E5EF] rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-[#082A52]">
                <Scale className="w-4 h-4 text-[#C89543]" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Honorários de Êxito (Quota Litis)
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">{t.contracts.lblQuotaLitisRate}</span>
                  <span className="font-bold text-[#082A52]">
                    {feeStructure.quotaLitisPercentage || 30}% sobre atrasados
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">{t.contracts.lblEstimatedRetroactive}</span>
                  <span className="font-medium text-slate-700">
                    {formatBrl(feeStructure.estimatedRetroactiveAmount)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-semibold">{t.contracts.lblProjectedSuccessFee}</span>
                  <span className="font-bold text-[#168447] text-sm">
                    {formatBrl(feeStructure.estimatedSuccessFeeAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Fixed / Installments Ledger Box */}
            <div className="bg-[#F8FAFC] border border-[#D8E5EF] rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-[#082A52]">
                <Banknote className="w-4 h-4 text-[#0B78D0]" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Honorários Fixos & Parcelamento
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">{t.contracts.lblFixedTotal}</span>
                  <span className="font-bold text-[#082A52]">{formatBrl(totalFixed)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">{t.contracts.lblPaidSoFar}</span>
                  <span className="font-bold text-[#168447]">{formatBrl(totalPaid)}</span>
                </div>
                <div className="flex justify-between py-1 items-center">
                  <span className="text-slate-500">{t.contracts.lblRemainingBalance}</span>
                  {isFullySettled ? (
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded text-xs border border-emerald-200">
                      <Check className="w-3 h-3 text-emerald-600" />
                      R$ 0,00 (Quitado)
                    </span>
                  ) : (
                    <span className="font-bold text-amber-600 text-sm">{formatBrl(totalOpen)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {totalFixed > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>{t.contracts.lblInstallmentProgress}</span>
                <span className={`font-mono ${isFullySettled ? 'text-emerald-700' : 'text-[#082A52]'}`}>
                  {isFullySettled
                    ? `100% QUITADO (${paidInstallments.length} de ${installments.length} parcelas)`
                    : `${progressPercent.toFixed(0)}% arrecadado (${paidInstallments.length} de ${installments.length} parcelas)`}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Installments Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#082A52] uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#0B78D0]" />
              Cronograma de Vencimento das Parcelas
            </h3>

            {installments.length === 0 ? (
              <div className="bg-[#EEF6FD] border border-[#D8E5EF] rounded-xl p-4 text-center text-xs text-slate-600">
                Este contrato foi celebrado na modalidade pura de <strong>Quota Litis (30% sobre os atrasados)</strong>, sem parcelas fixas prévias. O recebimento ocorrerá integralmente quando o INSS implantar o benefício e emitir o extrato de pagamento / RPV.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-[#082A52] border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2.5">Parcela</th>
                      <th className="px-3 py-2.5">Vencimento</th>
                      <th className="px-3 py-2.5">Valor (R$)</th>
                      <th className="px-3 py-2.5">Status</th>
                      <th className="px-3 py-2.5">Pagamento</th>
                      <th className="px-3 py-2.5 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {installments.map((inst) => {
                      const isPaid = inst.status === 'PAID';
                      const isOverdue = inst.status === 'OVERDUE';
                      return (
                        <tr key={inst.id} className="hover:bg-slate-50/50">
                          <td className="px-3 py-2.5 font-bold text-[#082A52]">
                            {inst.installmentNumber === 1 ? '1ª (Entrada)' : `${inst.installmentNumber}ª Parcela`}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-[11px]">
                            {formatDate(inst.dueDate)}
                          </td>
                          <td className="px-3 py-2.5 font-bold text-slate-900">
                            {formatBrl(inst.amount)}
                          </td>
                          <td className="px-3 py-2.5">
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Liquidada
                              </span>
                            ) : isOverdue ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                <AlertCircle className="w-3 h-3 text-rose-600" />
                                Vencida
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                                <Clock className="w-3 h-3 text-slate-500" />
                                Em Aberto
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-[11px] text-slate-600">
                            {isPaid ? (
                              <div className="space-y-0.5">
                                <div>
                                  {formatDate(inst.paidAt)} •{' '}
                                  <strong className="text-[#082A52]">{formatPaymentMethod(inst.paymentMethod)}</strong>
                                </div>
                                {inst.receiptReference && (
                                  <div className="text-[10px] text-slate-500 font-mono">
                                    Doc: {inst.receiptReference}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400">Aguardando Pagamento</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            {!isPaid && (
                              <button
                                type="button"
                                onClick={() => setSelectedInstallment(inst)}
                                className="px-2.5 py-1 bg-[#C89543] hover:bg-[#b08137] text-white text-[10px] font-bold rounded-lg shadow-2xs transition-colors"
                              >
                                Dar Baixa
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Inline Settlement Form when an installment is selected */}
          {selectedInstallment && (
            <div className="bg-[#FEF9EE] border border-[#C89543]/40 rounded-xl p-4 space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-[#C89543]/20">
                <div className="flex items-center gap-2 text-[#082A52]">
                  <Receipt className="w-4 h-4 text-[#C89543]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Registrar Baixa da {selectedInstallment.installmentNumber}ª Parcela —{' '}
                    {formatBrl(selectedInstallment.amount)}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedInstallment(null)}
                  className="text-slate-500 hover:text-slate-800 text-xs font-semibold"
                >
                  Cancelar
                </button>
              </div>

              <form onSubmit={handleConfirmSettle} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Forma de Pagamento *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C89543]"
                  >
                    <option value="PIX">PIX</option>
                    <option value="BOLETO">Boleto Bancário</option>
                    <option value="CASH">Dinheiro em Espécie</option>
                    <option value="CREDIT_CARD">Cartão de Crédito</option>
                    <option value="BANK_TRANSFER">Transferência Bancária</option>
                    <option value="RPV_PRECATORIO_RETENTION">Retenção de RPV / Precatório</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Código / Comprovante (Opcional)
                  </label>
                  <input
                    type="text"
                    value={receiptRef}
                    onChange={(e) => setReceiptRef(e.target.value)}
                    placeholder="ex: PIX-998877 ou Recibo 042"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C89543]"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 bg-[#168447] hover:bg-[#126b39] text-white font-bold rounded-lg shadow-sm transition-all"
                  >
                    Confirmar Recebimento
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* When no installment is selected and all are paid */}
          {isFullySettled && !selectedInstallment && (
            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-center text-xs text-emerald-900 font-medium flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Todas as parcelas deste contrato já foram pagas. Livro caixa liquidado e dívida finalizada.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors"
          >
            Fechar Painel
          </button>
        </div>
      </div>
    </div>
  );
}
