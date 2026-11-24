'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  FileSignature,
  CheckCircle2,
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
import { formatBenefitType } from '@/lib/utils/benefit-translations';
import {
  ContractClientSelector,
  type ClientOption,
  ContractTemplateBenefitSection,
  ContractFeeRegimeSection,
  ContractPdfUploadSection,
} from './new-contract-sections';

interface NewContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: ContractTemplate[];
  selectedTemplateFromLibrary?: ContractTemplate | null;
  onContractCreated: (contractData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function NewContractModal({
  isOpen,
  onClose,
  templates,
  selectedTemplateFromLibrary,
  onContractCreated,
}: NewContractModalProps) {
  const { t, locale } = useI18n();
  const { currentUser } = useAuth();
  const isEn = locale === 'en-US';

  // Clients state
  const [clientOptions, setClientOptions] = useState<ClientOption[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');

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
  const [cabinetLocation, setCabinetLocation] = useState('Armário Geral - Pasta 2026');

  // Custom PDF replacement state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedDataUrl, setUploadedDataUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileSizeFormatted, setUploadedFileSizeFormatted] = useState('');
  const [documentCategory, setDocumentCategory] = useState<'FEE_CONTRACT' | 'POWER_OF_ATTORNEY' | 'OTHER'>('FEE_CONTRACT');
  const [isSignedDocument, setIsSignedDocument] = useState<boolean>(false);

  // Load real clients from database on mount or when tenant changes
  useEffect(() => {
    let isMounted = true;
    async function loadRealClients() {
      if (!currentUser?.tenantId) return;
      try {
        const dbClients = await fetchClientsFromDb(currentUser.tenantId);
        if (isMounted) {
          if (dbClients && dbClients.length > 0) {
            const mapped = dbClients.map((c) => ({
              id: c.id,
              name: c.fullName || 'Cliente Sem Nome',
              cpf: c.cpf ? maskCpf(c.cpf) : 'Não informado',
              phone: c.phone || '',
              location: `Armário Geral - Pasta ${c.id.substring(0, 8)}`,
              benefit: c.benefitType ? formatBenefitType(c.benefitType, 'pt-BR') : 'Benefício Previdenciário',
            }));
            setClientOptions(mapped);
            setSelectedClientId(mapped[0].id);
            setCabinetLocation(mapped[0].location);
            if (mapped[0].benefit) {
              const formatted = formatBenefitType(mapped[0].benefit, 'pt-BR');
              setBenefitSpecies(formatted);
              const matched = templates.find(
                (tpl) =>
                  (formatBenefitType(tpl.benefitSpecies, 'pt-BR') === formatted || tpl.benefitSpecies === mapped[0].benefit) &&
                  tpl.isDefault &&
                  (tpl.documentCategory === 'FEE_CONTRACT' || !tpl.documentCategory)
              ) || templates.find(
                (tpl) => (tpl.documentCategory === 'FEE_CONTRACT' || !tpl.documentCategory) && tpl.isDefault
              ) || templates.find(
                (tpl) => formatBenefitType(tpl.benefitSpecies, 'pt-BR') === formatted || tpl.benefitSpecies === mapped[0].benefit
              ) || templates[0];

              if (matched) {
                setTemplateId(matched.id);
                setFeeModel(matched.defaultFeeModel);
                if (matched.defaultQuotaLitisPercentage) {
                  setQuotaLitisPercentage(matched.defaultQuotaLitisPercentage);
                }
              }
            }
          } else {
            setClientOptions([]);
            setSelectedClientId('');
          }
        }
      } catch (err) {
        console.warn('Could not load clients from DB:', err);
        if (isMounted) {
          setClientOptions([]);
          setSelectedClientId('');
        }
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
      setBenefitSpecies(formatBenefitType(selectedTemplateFromLibrary.benefitSpecies, 'pt-BR'));
      setFeeModel(selectedTemplateFromLibrary.defaultFeeModel);
      if (selectedTemplateFromLibrary.defaultQuotaLitisPercentage) {
        setQuotaLitisPercentage(selectedTemplateFromLibrary.defaultQuotaLitisPercentage);
      }
    }
  }, [selectedTemplateFromLibrary, isOpen]);

  if (!isOpen) return null;

  const currentClient = clientOptions.find((c) => c.id === selectedClientId) || clientOptions[0];

  const autoSelectDefaultTemplate = (targetBenefit: string) => {
    const formatted = formatBenefitType(targetBenefit, 'pt-BR');
    const matched = templates.find(
      (tpl) =>
        (formatBenefitType(tpl.benefitSpecies, 'pt-BR') === formatted || tpl.benefitSpecies === targetBenefit) &&
        tpl.isDefault &&
        (tpl.documentCategory === 'FEE_CONTRACT' || !tpl.documentCategory)
    ) || templates.find(
      (tpl) => (tpl.documentCategory === 'FEE_CONTRACT' || !tpl.documentCategory) && tpl.isDefault
    ) || templates.find(
      (tpl) => formatBenefitType(tpl.benefitSpecies, 'pt-BR') === formatted || tpl.benefitSpecies === targetBenefit
    ) || templates[0];

    if (matched) {
      setTemplateId(matched.id);
      setFeeModel(matched.defaultFeeModel);
      if (matched.defaultQuotaLitisPercentage) {
        setQuotaLitisPercentage(matched.defaultQuotaLitisPercentage);
      }
    }
  };

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clientOptions.find((c) => c.id === clientId);
    if (client) {
      setCabinetLocation(client.location);
      if (client.benefit) {
        const formatted = formatBenefitType(client.benefit, 'pt-BR');
        setBenefitSpecies(formatted);
        autoSelectDefaultTemplate(formatted);
      }
    }
  };

  const handleTemplateChange = (tplId: string) => {
    setTemplateId(tplId);
    const tpl = templates.find((item) => item.id === tplId);
    if (tpl) {
      setBenefitSpecies(formatBenefitType(tpl.benefitSpecies, 'pt-BR'));
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
      alert(isEn ? 'Please select a valid PDF file.' : 'Por favor, selecione apenas arquivos válidos no formato PDF.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert(isEn ? 'The selected file exceeds the 15MB limit.' : 'O arquivo selecionado ultrapassa o limite máximo permitido de 15MB.');
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentClient || clientOptions.length === 0) {
      alert(
        isEn
          ? 'No client selected. Register a client before issuing a contract.'
          : 'Nenhum cliente selecionado. Cadastre um cliente no sistema antes de formalizar um contrato.'
      );
      return;
    }

    const contractNumber = `CTR-2026-${String(Math.floor(Math.random() * 900) + 100)}`;
    const projectedSuccessFee =
      feeModel !== 'FIXED_INSTALLMENT'
        ? (estimatedRetroactive * quotaLitisPercentage) / 100
        : undefined;

    const installments: FeeInstallment[] =
      feeModel !== 'QUOTA_LITIS'
        ? generateFeeInstallments(fixedAmount, installmentsCount, firstDueDate, contractNumber)
        : [];

    const tpl = templates.find((item) => item.id === templateId);

    let customAttachment: PhysicalDocumentAttachment | undefined = undefined;
    if (uploadedFile && uploadedDataUrl) {
      customAttachment = {
        id: `att-${Date.now()}`,
        fileName: uploadedFileName,
        fileSizeFormatted: uploadedFileSizeFormatted,
        fileType: 'application/pdf',
        uploadedAt: new Date().toISOString(),
        uploadedBy: currentUser?.fullName || 'Advogado(a) Responsável',
        physicalCabinetLocation: cabinetLocation || 'Armário Geral',
        signerType: 'CLIENT_SIGNATURE',
        documentCategory,
        isSigned: isSignedDocument,
        fileDataUrl: uploadedDataUrl,
        replacedAt: new Date().toISOString(),
        replacedBy: currentUser?.fullName || 'Advogado(a) Responsável',
      };
    }

    const finalPhysicalStatus = customAttachment
      ? (isSignedDocument ? 'ATTACHED' : 'PENDING')
      : 'PENDING';

    const finalContractStatus = isSignedDocument ? 'ACTIVE' : 'PENDING_SIGNATURE';

    onContractCreated({
      tenantId: currentUser?.tenantId || '',
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
      lawyerName: tpl?.lawyerName || currentUser?.fullName || 'Advogado(a) Responsável',
      lawyerOab: tpl?.lawyerOab || (currentUser as any)?.oabNumber || '',
      officeName: (currentUser as any)?.officeName || 'Sociedade de Advogados',
      issuedAt: new Date().toISOString(),
      signedAt: isSignedDocument ? new Date().toISOString() : undefined,
      physicalFileLocation: cabinetLocation || 'Armário Geral',
    });

    handleRemoveFile();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#082A52] text-[#C89543] rounded-xl shadow-xs">
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
            aria-label={isEn ? 'Close' : 'Fechar'}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          <ContractClientSelector
            clientOptions={clientOptions}
            selectedClientId={selectedClientId}
            onClientChange={handleClientChange}
            locale={locale}
          />

          <ContractTemplateBenefitSection
            templates={templates}
            templateId={templateId}
            onTemplateChange={handleTemplateChange}
            benefitSpecies={benefitSpecies}
            onBenefitChange={setBenefitSpecies}
            onBenefitBlur={() => autoSelectDefaultTemplate(benefitSpecies)}
            locale={locale}
          />

          <ContractFeeRegimeSection
            feeModel={feeModel}
            onFeeModelChange={setFeeModel}
            quotaLitisPercentage={quotaLitisPercentage}
            onQuotaLitisChange={setQuotaLitisPercentage}
            estimatedRetroactive={estimatedRetroactive}
            onEstimatedRetroactiveChange={setEstimatedRetroactive}
            fixedAmount={fixedAmount}
            onFixedAmountChange={setFixedAmount}
            installmentsCount={installmentsCount}
            onInstallmentsCountChange={setInstallmentsCount}
            firstDueDate={firstDueDate}
            onFirstDueDateChange={setFirstDueDate}
            locale={locale}
          />

          <ContractPdfUploadSection
            uploadedFile={uploadedFile}
            uploadedFileName={uploadedFileName}
            uploadedFileSizeFormatted={uploadedFileSizeFormatted}
            documentCategory={documentCategory}
            onDocumentCategoryChange={setDocumentCategory}
            isSignedDocument={isSignedDocument}
            onIsSignedDocumentChange={setIsSignedDocument}
            cabinetLocation={cabinetLocation}
            onCabinetLocationChange={setCabinetLocation}
            onProcessFile={handleProcessFile}
            onRemoveFile={handleRemoveFile}
            locale={locale}
          />

          {/* Submit */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
            >
              {isEn ? 'Cancel' : 'Cancelar'}
            </button>
            <button
              type="submit"
              disabled={clientOptions.length === 0}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold shadow-md transition-all ${
                clientOptions.length === 0
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-[#082A52] text-white hover:bg-[#0c396d]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-[#C89543]" />
              <span>{isEn ? 'Issue and Generate Contract' : 'Formalizar e Gerar Contrato'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
