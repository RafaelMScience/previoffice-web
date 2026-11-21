'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  FileSignature,
  Percent,
  Layers,
  FolderLock,
  Sparkles,
  UserCheck,
  CheckCircle2,
  UploadCloud,
  FileText,
  Trash2,
  ShieldCheck,
  Clock,
  Check,
} from 'lucide-react';
import type {
  Contract,
  ContractTemplate,
  FeeModel,
  FeeInstallment,
  PhysicalDocumentAttachment,
} from '@/types/contract';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useAuth } from '@/lib/auth/auth-context';
import { fetchClientsFromDb } from '@/lib/services/client-service';
import { maskCpf } from '@/lib/utils/masks';
import { generateFeeInstallments } from '@/lib/utils/template-engine';

interface NewContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: ContractTemplate[];
  selectedTemplateFromLibrary?: ContractTemplate | null;
  onContractCreated: (contractData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

// Fallback clients if database query returns empty
const FALLBACK_CLIENTS = [
  { id: 'cli-001', name: 'Maria Francisca da Silva', cpf: '123.456.789-09', phone: '(83) 98765-4321', location: 'Armário B - Gaveta 03 - Pasta 2026-042', benefit: 'Aposentadoria Rural' },
  { id: 'cli-002', name: 'José Carlos Pereira', cpf: '234.567.890-12', phone: '(83) 99123-4567', location: 'Armário A - Gaveta 01 - Pasta 2026-043', benefit: 'Auxílio por Incapacidade Temporária' },
  { id: 'cli-003', name: 'Ana Lúcia dos Santos', cpf: '345.678.901-23', phone: '(83) 98877-6655', location: 'Armário B - Gaveta 02 - Pasta 2026-044', benefit: 'BPC/LOAS Idoso' },
  { id: 'cli-004', name: 'Raimundo Nonato de Sousa', cpf: '456.789.012-34', phone: '(83) 99881-2233', location: 'Armário C - Gaveta 01 - Pasta 2026-045', benefit: 'Pensão por Morte Rural' },
  { id: 'cli-005', name: 'Severina Maria da Conceição', cpf: '567.890.123-45', phone: '(83) 98711-3344', location: 'Armário A - Gaveta 03 - Pasta 2026-046', benefit: 'Aposentadoria Urbana (Idade)' },
];

export function NewContractModal({
  isOpen,
  onClose,
  templates,
  selectedTemplateFromLibrary,
  onContractCreated,
}: NewContractModalProps) {
  const { t } = useI18n();
  const { currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clients state
  const [clientOptions, setClientOptions] = useState(FALLBACK_CLIENTS);
  const [selectedClientId, setSelectedClientId] = useState(FALLBACK_CLIENTS[0].id);

  // Contract form state
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
  const [cabinetLocation, setCabinetLocation] = useState(FALLBACK_CLIENTS[0].location);

  // Custom PDF replacement state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedDataUrl, setUploadedDataUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileSizeFormatted, setUploadedFileSizeFormatted] = useState('');
  const [documentCategory, setDocumentCategory] = useState<'FEE_CONTRACT' | 'POWER_OF_ATTORNEY' | 'OTHER'>('FEE_CONTRACT');
  const [isSignedDocument, setIsSignedDocument] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState(false);

  // Load real clients from database on mount or when tenant changes
  useEffect(() => {
    let isMounted = true;
    async function loadRealClients() {
      if (!currentUser?.tenantId) return;
      try {
        const dbClients = await fetchClientsFromDb(currentUser.tenantId);
        if (isMounted && dbClients && dbClients.length > 0) {
          const mapped = dbClients.map((c) => ({
            id: c.id,
            name: c.fullName || 'Cliente Sem Nome',
            cpf: c.cpf ? maskCpf(c.cpf) : 'Não informado',
            phone: c.phone || '',
            location: `Armário Geral - Pasta ${c.id.substring(0, 8)}`,
            benefit: c.benefitType || 'Benefício Previdenciário',
          }));
          setClientOptions(mapped);
          setSelectedClientId(mapped[0].id);
          setCabinetLocation(mapped[0].location);
          if (mapped[0].benefit) {
            setBenefitSpecies(mapped[0].benefit);
          }
        }
      } catch (err) {
        console.warn('Could not load clients from DB, using fallback list:', err);
      }
    }

    if (isOpen) {
      loadRealClients();
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, currentUser?.tenantId]);

  // Sync selectedTemplateFromLibrary when prop changes or modal opens
  useEffect(() => {
    if (selectedTemplateFromLibrary && isOpen) {
      setTemplateId(selectedTemplateFromLibrary.id);
      setBenefitSpecies(selectedTemplateFromLibrary.benefitSpecies);
      setFeeModel(selectedTemplateFromLibrary.defaultFeeModel);
      if (selectedTemplateFromLibrary.defaultQuotaLitisPercentage) {
        setQuotaLitisPercentage(selectedTemplateFromLibrary.defaultQuotaLitisPercentage);
      }
    }
  }, [selectedTemplateFromLibrary, isOpen]);

  if (!isOpen) return null;

  const currentClient = clientOptions.find((c) => c.id === selectedClientId) || clientOptions[0];

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clientOptions.find((c) => c.id === clientId);
    if (client) {
      setCabinetLocation(client.location);
      if (client.benefit) {
        setBenefitSpecies(client.benefit);
      }
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

  const handleProcessFile = (file: File) => {
    const isPdfExt = file.name.toLowerCase().endsWith('.pdf');
    const isPdfMime = file.type === 'application/pdf' || file.type.includes('pdf');
    if (!isPdfExt || (!isPdfMime && file.type !== '')) {
      alert('Por favor, selecione apenas arquivos válidos no formato PDF.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert('O arquivo selecionado ultrapassa o limite máximo permitido de 15MB.');
      return;
    }

    setUploadedFile(file);
    setUploadedFileName(file.name);
    setUploadedFileSizeFormatted(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedDataUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadedDataUrl(null);
    setUploadedFileName('');
    setUploadedFileSizeFormatted('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const contractNumber = `CTR-2026-${String(Math.floor(Math.random() * 900) + 100)}`;
    const projectedSuccessFee =
      feeModel !== 'FIXED_INSTALLMENT'
        ? (estimatedRetroactive * quotaLitisPercentage) / 100
        : undefined;

    // Generate schedule with precise cent-rounding and date clamping
    const installments: FeeInstallment[] =
      feeModel !== 'QUOTA_LITIS'
        ? generateFeeInstallments(fixedAmount, installmentsCount, firstDueDate, contractNumber)
        : [];

    const tpl = templates.find((t) => t.id === templateId);

    // Build custom attachment if lawyer uploaded a PDF
    let customAttachment: PhysicalDocumentAttachment | undefined = undefined;
    if (uploadedFile && uploadedDataUrl) {
      customAttachment = {
        id: `att-${Date.now()}`,
        fileName: uploadedFileName,
        fileSizeFormatted: uploadedFileSizeFormatted,
        fileType: 'application/pdf',
        uploadedAt: new Date().toISOString(),
        uploadedBy: currentUser?.fullName || 'Dr. Alexandre Pontes',
        physicalCabinetLocation: cabinetLocation || 'Armário Geral',
        signerType: 'CLIENT_SIGNATURE',
        documentCategory,
        isSigned: isSignedDocument,
        fileDataUrl: uploadedDataUrl,
        replacedAt: new Date().toISOString(),
        replacedBy: currentUser?.fullName || 'Dr. Alexandre Pontes',
      };
    }

    const finalPhysicalStatus = customAttachment
      ? (isSignedDocument ? 'ATTACHED' : 'PENDING')
      : 'PENDING';

    const finalContractStatus = isSignedDocument ? 'ACTIVE' : 'PENDING_SIGNATURE';

    onContractCreated({
      tenantId: currentUser?.tenantId || 'tenant-001',
      clientId: currentClient.id,
      clientName: currentClient.name,
      clientCpf: currentClient.cpf,
      clientPhone: currentClient.phone,
      contractNumber,
      templateId,
      templateTitle: tpl?.title,
      benefitSpecies,
      status: finalContractStatus,
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
      physicalSignedStatus: finalPhysicalStatus,
      physicalAttachment: customAttachment,
      customContractAttachment:
        customAttachment?.documentCategory === 'FEE_CONTRACT' ? customAttachment : undefined,
      customPoaAttachment:
        customAttachment?.documentCategory === 'POWER_OF_ATTORNEY' ? customAttachment : undefined,
      customDocuments: customAttachment ? [customAttachment] : [],
      isCustomEdited: Boolean(customAttachment),
      customEditedBy: customAttachment?.replacedBy,
      customEditedAt: customAttachment?.replacedAt,
      lawyerName: tpl?.lawyerName || 'Dr. Alexandre Pontes',
      lawyerOab: tpl?.lawyerOab || 'OAB/AM 55.858',
      officeName: 'Alexandre Pontes Sociedade de Advogados',
      issuedAt: new Date().toISOString(),
      signedAt: isSignedDocument ? new Date().toISOString() : undefined,
      physicalFileLocation: cabinetLocation || 'Armário Geral',
    });

    handleRemoveFile();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
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
          {/* Client Selection (Real DB clients) */}
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
              {clientOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} • CPF: {c.cpf} {c.benefit ? `(${c.benefit})` : ''}
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

          {/* Custom PDF Upload Section (Replaces mandatory physical location) */}
          <div className="p-4 bg-slate-50/90 border border-slate-300 rounded-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#082A52] uppercase flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-[#0B78D0]" />
                <span>4. Substituir Minuta por PDF Próprio do Escritório (Opcional)</span>
              </label>
              {uploadedFile && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <Check className="w-3 h-3 text-emerald-600" />
                  PDF Vinculado
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Caso você já possua um modelo próprio formatado com sua identidade visual (logotipo, cores, fontes ou cabeçalho próprio), envie o arquivo em PDF para <strong>substituir o modelo gerado pelo sistema</strong> como padrão deste cliente.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleProcessFile(file);
              }}
            />

            {!uploadedFile ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files[0];
                  if (file) handleProcessFile(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-[#0B78D0] bg-blue-50/70 scale-[0.99]'
                    : 'border-slate-300 hover:border-[#0B78D0] bg-white hover:bg-slate-50/50'
                }`}
              >
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-700">
                  Arraste e solte o arquivo PDF aqui ou clique para selecionar
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Suporta arquivos .PDF de até 15MB com sua formatação personalizada
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* File summary card */}
                <div className="p-3 bg-white border border-emerald-300 rounded-lg flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-7 h-7 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold text-xs text-slate-800 truncate max-w-sm">
                        {uploadedFileName}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {uploadedFileSizeFormatted} • Documento PDF pronto para armazenamento seguro
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remover arquivo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Purpose / Category of Document */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    Finalidade do Documento PDF Enviado:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDocumentCategory('FEE_CONTRACT')}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        documentCategory === 'FEE_CONTRACT'
                          ? 'border-[#082A52] bg-white ring-2 ring-[#082A52]/20 font-bold text-[#082A52]'
                          : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <div className="text-xs">Contrato de Honorários</div>
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                        Substitui o contrato OAB
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDocumentCategory('POWER_OF_ATTORNEY')}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        documentCategory === 'POWER_OF_ATTORNEY'
                          ? 'border-[#082A52] bg-white ring-2 ring-[#082A52]/20 font-bold text-[#082A52]'
                          : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <div className="text-xs">Procuração Ad Judicia</div>
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                        Substitui a procuração
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDocumentCategory('OTHER')}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        documentCategory === 'OTHER'
                          ? 'border-[#082A52] bg-white ring-2 ring-[#082A52]/20 font-bold text-[#082A52]'
                          : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <div className="text-xs">Outros Documentos</div>
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                        Dossiê ou anexo advocatício
                      </div>
                    </button>
                  </div>
                </div>

                {/* Signature status radio */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    Estado da Assinatura do Documento Enviado:
                  </label>
                  <div className="space-y-2">
                    <label
                      className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                        isSignedDocument
                          ? 'border-emerald-500 bg-emerald-50/70'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="signatureStatus"
                        checked={isSignedDocument}
                        onChange={() => setIsSignedDocument(true)}
                        className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Já está assinado pelo cliente</span>
                        </div>
                        <p className="text-[11px] text-emerald-800/90 mt-0.5">
                          O contrato será gerado com status <strong>Assinado / Ativo</strong> e este PDF personalizado será o documento padrão definitivo do cliente na plataforma.
                        </p>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                        !isSignedDocument
                          ? 'border-amber-500 bg-amber-50/70'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="signatureStatus"
                        checked={!isSignedDocument}
                        onChange={() => setIsSignedDocument(false)}
                        className="mt-0.5 text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Não está assinado (Minuta personalizada para colher assinatura)</span>
                        </div>
                        <p className="text-[11px] text-amber-800/90 mt-0.5">
                          Substitui a minuta padrão do sistema pelo seu PDF customizado. O status ficará <strong>Pendente de Assinatura</strong>, e ao colher a assinatura bastará anexar a via finalizada pelo ícone de anexo da tabela.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Optional Physical Cabinet location */}
            <div className="pt-2 border-t border-slate-200">
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                <FolderLock className="w-3.5 h-3.5 text-amber-600" />
                <span>Localização da Pasta no Arquivo Físico (Opcional)</span>
              </label>
              <input
                type="text"
                value={cabinetLocation}
                onChange={(e) => setCabinetLocation(e.target.value)}
                placeholder="Ex: Armário B - Gaveta 03 - Pasta 2026-042"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-800 bg-white"
              />
            </div>
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
