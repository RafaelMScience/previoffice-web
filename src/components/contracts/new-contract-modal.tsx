'use client';

import React, { useState } from 'react';
import {
  X,
  FileSignature,
  Percent,
  Layers,
  FolderLock,
  Sparkles,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import type {
  Contract,
  ContractTemplate,
  FeeModel,
  FeeInstallment,
} from '@/types/contract';
import { useI18n } from '@/lib/i18n/i18n-context';

interface NewContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: ContractTemplate[];
  selectedTemplateFromLibrary?: ContractTemplate | null;
  onContractCreated: (contractData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

// Pre-seeded clients for quick selection
const CLIENT_OPTIONS = [
  { id: 'cli-001', name: 'Maria Francisca da Silva', cpf: '123.456.789-09', phone: '(83) 98765-4321', location: 'Armário B - Gaveta 03 - Pasta 2026-042' },
  { id: 'cli-002', name: 'José Carlos Pereira', cpf: '234.567.890-12', phone: '(83) 99123-4567', location: 'Armário A - Gaveta 01 - Pasta 2026-043' },
  { id: 'cli-003', name: 'Ana Lúcia dos Santos', cpf: '345.678.901-23', phone: '(83) 98877-6655', location: 'Armário B - Gaveta 02 - Pasta 2026-044' },
  { id: 'cli-004', name: 'Raimundo Nonato de Sousa', cpf: '456.789.012-34', phone: '(83) 99881-2233', location: 'Armário C - Gaveta 01 - Pasta 2026-045' },
  { id: 'cli-005', name: 'Severina Maria da Conceição', cpf: '567.890.123-45', phone: '(83) 98711-3344', location: 'Armário A - Gaveta 03 - Pasta 2026-046' },
];

export function NewContractModal({
  isOpen,
  onClose,
  templates,
  selectedTemplateFromLibrary,
  onContractCreated,
}: NewContractModalProps) {
  const { t } = useI18n();

  const [selectedClientId, setSelectedClientId] = useState(CLIENT_OPTIONS[0].id);
  const [templateId, setTemplateId] = useState(
    selectedTemplateFromLibrary?.id || templates[0]?.id || ''
  );
  const [benefitSpecies, setBenefitSpecies] = useState('Aposentadoria por Idade Rural');
  const [feeModel, setFeeModel] = useState<FeeModel>('QUOTA_LITIS');
  const [quotaLitisPercentage, setQuotaLitisPercentage] = useState(30);
  const [estimatedRetroactive, setEstimatedRetroactive] = useState(36000);
  const [fixedAmount, setFixedAmount] = useState(2400);
  const [installmentsCount, setInstallmentsCount] = useState(6);
  const [firstDueDate, setFirstDueDate] = useState(
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [cabinetLocation, setCabinetLocation] = useState(CLIENT_OPTIONS[0].location);

  if (!isOpen) return null;

  const currentClient = CLIENT_OPTIONS.find((c) => c.id === selectedClientId) || CLIENT_OPTIONS[0];

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = CLIENT_OPTIONS.find((c) => c.id === clientId);
    if (client) {
      setCabinetLocation(client.location);
    }
  };

  const handleTemplateChange = (tplId: string) => {
    setTemplateId(tplId);
    const tpl = templates.find((t) => t.id === tplId);
    if (tpl) {
      setBenefitSpecies(tpl.benefitSpecies);
      setFeeModel(tpl.defaultFeeModel);
      if (tpl.defaultQuotaLitisPercentage) {
        setQuotaLitisPercentage(tpl.defaultQuotaLitisPercentage);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const contractNumber = `CTR-2026-${String(Math.floor(Math.random() * 900) + 100)}`;
    const projectedSuccessFee =
      feeModel !== 'FIXED_INSTALLMENT'
        ? (estimatedRetroactive * quotaLitisPercentage) / 100
        : undefined;

    // Generate schedule if installment model
    const installments: FeeInstallment[] = [];
    if (feeModel === 'FIXED_INSTALLMENT' || feeModel === 'HYBRID') {
      const perInstallmentAmount = fixedAmount / installmentsCount;
      const baseDate = new Date(firstDueDate);

      for (let i = 1; i <= installmentsCount; i++) {
        const due = new Date(baseDate);
        due.setMonth(baseDate.getMonth() + (i - 1));

        installments.push({
          id: `inst-${Date.now()}-${i}`,
          contractId: contractNumber,
          installmentNumber: i,
          amount: Math.round(perInstallmentAmount * 100) / 100,
          dueDate: due.toISOString().split('T')[0],
          status: 'PENDING',
        });
      }
    }

    const tpl = templates.find((t) => t.id === templateId);

    onContractCreated({
      tenantId: 'tenant-001',
      clientId: currentClient.id,
      clientName: currentClient.name,
      clientCpf: currentClient.cpf,
      clientPhone: currentClient.phone,
      contractNumber,
      templateId,
      templateTitle: tpl?.title,
      benefitSpecies,
      status: 'ACTIVE',
      feeStructure: {
        feeModel,
        quotaLitisPercentage: feeModel !== 'FIXED_INSTALLMENT' ? quotaLitisPercentage : undefined,
        estimatedRetroactiveAmount:
          feeModel !== 'FIXED_INSTALLMENT' ? estimatedRetroactive : undefined,
        estimatedSuccessFeeAmount: projectedSuccessFee,
        fixedTotalAmount: feeModel !== 'QUOTA_LITIS' ? fixedAmount : undefined,
        installmentCount: feeModel !== 'QUOTA_LITIS' ? installmentsCount : 0,
        installments,
      },
      physicalSignedStatus: 'PENDING',
      lawyerName: 'Dr. Alexandre Pontes',
      lawyerOab: 'OAB/PB 18.234',
      officeName: 'Alexandre Pontes Sociedade de Advogados',
      issuedAt: new Date().toISOString(),
      physicalFileLocation: cabinetLocation,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#082A52] text-[#C89543] rounded-xl shadow-sm">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-[#082A52]">
                {t.contracts.modalNewContractTitle}
              </h3>
              <p className="text-xs text-slate-500">
                {t.contracts.modalNewContractSubtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Client Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#0B78D0]" />
              <span>1. Selecionar Cliente da Banca *</span>
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => handleClientChange(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B78D0]/30 font-medium"
            >
              {CLIENT_OPTIONS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} • CPF: {c.cpf} ({c.location})
                </option>
              ))}
            </select>
          </div>

          {/* Template & Benefit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C89543]" />
                <span>2. Minuta Padrão Vinculada</span>
              </label>
              <select
                value={templateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B78D0]/30"
              >
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#0B78D0]" />
                <span>Benefício / Objeto Contratual *</span>
              </label>
              <input
                type="text"
                required
                value={benefitSpecies}
                onChange={(e) => setBenefitSpecies(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B78D0]/30"
              />
            </div>
          </div>

          {/* Fee Regime */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#082A52] uppercase mb-2">
                3. Regime de Remuneração e Honorários Advocatícios
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFeeModel('QUOTA_LITIS')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    feeModel === 'QUOTA_LITIS'
                      ? 'border-[#082A52] bg-white ring-2 ring-[#082A52]/20 shadow-sm'
                      : 'border-slate-200 bg-white/60 text-slate-600 hover:bg-white'
                  }`}
                >
                  <div className="font-bold text-xs text-[#082A52]">Quota Litis</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Êxito puro sobre atrasados
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFeeModel('FIXED_INSTALLMENT')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    feeModel === 'FIXED_INSTALLMENT'
                      ? 'border-[#082A52] bg-white ring-2 ring-[#082A52]/20 shadow-sm'
                      : 'border-slate-200 bg-white/60 text-slate-600 hover:bg-white'
                  }`}
                >
                  <div className="font-bold text-xs text-[#082A52]">Parcelamento</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Carnê / parcelas mensais
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFeeModel('HYBRID')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    feeModel === 'HYBRID'
                      ? 'border-[#082A52] bg-white ring-2 ring-[#082A52]/20 shadow-sm'
                      : 'border-slate-200 bg-white/60 text-slate-600 hover:bg-white'
                  }`}
                >
                  <div className="font-bold text-xs text-[#082A52]">Híbrido</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Entrada + Quota Litis
                  </div>
                </button>
              </div>
            </div>

            {/* Quota Litis Inputs */}
            {feeModel !== 'FIXED_INSTALLMENT' && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Percentual de Êxito (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={10}
                      max={50}
                      value={quotaLitisPercentage}
                      onChange={(e) => setQuotaLitisPercentage(Number(e.target.value))}
                      className="w-full pl-3 pr-8 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                    />
                    <Percent className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Estimativa de Atrasados (R$)
                  </label>
                  <input
                    type="number"
                    step="500"
                    value={estimatedRetroactive}
                    onChange={(e) => setEstimatedRetroactive(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                  />
                  <div className="text-[10px] text-emerald-700 mt-1 font-semibold">
                    Êxito previsto: R${' '}
                    {((estimatedRetroactive * quotaLitisPercentage) / 100).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Installments Inputs */}
            {feeModel !== 'QUOTA_LITIS' && (
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Valor Fixo Total (R$)
                  </label>
                  <input
                    type="number"
                    step="100"
                    value={fixedAmount}
                    onChange={(e) => setFixedAmount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Nº de Parcelas
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={installmentsCount}
                    onChange={(e) => setInstallmentsCount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">
                    {installmentsCount}x de R${' '}
                    {(fixedAmount / (installmentsCount || 1)).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    1º Vencimento
                  </label>
                  <input
                    type="date"
                    value={firstDueDate}
                    onChange={(e) => setFirstDueDate(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-800"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Physical Cabinet location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
              <FolderLock className="w-3.5 h-3.5 text-amber-600" />
              <span>Localização da Pasta no Arquivo Físico *</span>
            </label>
            <input
              type="text"
              required
              value={cabinetLocation}
              onChange={(e) => setCabinetLocation(e.target.value)}
              placeholder="Ex: Armário B - Gaveta 03 - Pasta 2026-042"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#082A52] text-white hover:bg-[#0c396d] text-xs font-bold shadow-md transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-[#C89543]" />
              <span>Formalizar e Gerar Contrato</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
