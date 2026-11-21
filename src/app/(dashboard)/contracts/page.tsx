'use client';

import React, { useState, useEffect } from 'react';
import {
  Scale,
  Plus,
  BookOpen,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import type {
  Contract,
  ContractTemplate,
  ContractKpis,
  PaymentMethod,
  PhysicalDocumentAttachment,
} from '@/types/contract';
import { contractsStore } from '@/lib/data/mock-contracts';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useAuth } from '@/lib/auth/auth-context';
import { AccessDeniedBoundary } from '@/components/ui/access-denied-boundary';
import { createClient } from '@/lib/supabase/client';

import { ContractsKpiCards } from '@/components/contracts/contracts-kpi-cards';
import {
  ContractsTable,
  type ContractFilterTab,
} from '@/components/contracts/contracts-table';
import { InstallmentsDrawerModal } from '@/components/contracts/installments-drawer-modal';
import { UploadSignedModal } from '@/components/contracts/upload-signed-modal';
import { ContractPrintModal } from '@/components/contracts/contract-print-modal';
import { TemplatesManagementView } from '@/components/contracts/templates-management-view';
import { NewContractModal } from '@/components/contracts/new-contract-modal';

type ActiveViewTab = 'CONTRACTS' | 'TEMPLATES';

export default function ContractsPage() {
  const { t } = useI18n();
  const { canAccess } = useAuth();

  // Core Data State
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [kpis, setKpis] = useState<ContractKpis | null>(null);

  // View & Filter State
  const [activeViewTab, setActiveViewTab] = useState<ActiveViewTab>('CONTRACTS');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<ContractFilterTab>('ALL');

  // Modal State
  const [selectedContractForInstallments, setSelectedContractForInstallments] = useState<Contract | null>(null);
  const [isInstallmentsOpen, setIsInstallmentsOpen] = useState(false);

  const [selectedContractForUpload, setSelectedContractForUpload] = useState<Contract | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const [selectedContractForPrint, setSelectedContractForPrint] = useState<Contract | null>(null);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  const [isNewContractOpen, setIsNewContractOpen] = useState(false);
  const [selectedTemplateForNewContract, setSelectedTemplateForNewContract] = useState<ContractTemplate | null>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const refreshData = () => {
    setContracts(contractsStore.getContracts());
    setTemplates(contractsStore.getTemplates());
    setKpis(contractsStore.getKpis());
  };

  useEffect(() => {
    refreshData();
  }, []);

  if (!canAccess('contractsAndFinancial')) {
    return (
      <AccessDeniedBoundary
        moduleName="Contratos, Honorários & Quota Litis"
        requiredPermissionLabel="Contratos, Honorários & Livro Caixa (contractsAndFinancial)"
      />
    );
  }

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Settle installment handler
  const handleSettleInstallment = (
    contractId: string,
    installmentId: string,
    paymentMethod: PaymentMethod,
    receiptReference?: string,
    notes?: string
  ) => {
    const updated = contractsStore.settleInstallment(
      contractId,
      installmentId,
      paymentMethod,
      receiptReference,
      notes
    );
    if (updated) {
      refreshData();
      setSelectedContractForInstallments(updated);
      triggerToast(t.contracts.settleSuccessToast);
    }
  };

  // Database audit and persistence helper
  const persistContractAndAudit = async (
    contract: Contract,
    actionTitle: string,
    actionDetail: string
  ) => {
    try {
      const supabase = createClient();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        contract.clientId
      );

      // 1. Upsert into contracts table (only if client_id is valid UUID)
      if (isUuid) {
        await (supabase.from('contracts') as any).upsert(
          {
            tenant_id: contract.tenantId,
            client_id: contract.clientId,
            contract_number: contract.contractNumber,
            template_id: contract.templateId,
            template_title: contract.templateTitle,
            benefit_species: contract.benefitSpecies,
            status: contract.status,
            fee_structure: {
              ...contract.feeStructure,
              physicalAttachment: contract.physicalAttachment
                ? { ...contract.physicalAttachment, fileDataUrl: undefined } // Do not bloat jsonb
                : undefined,
              customContractAttachment: contract.customContractAttachment
                ? { ...contract.customContractAttachment, fileDataUrl: undefined }
                : undefined,
              customPoaAttachment: contract.customPoaAttachment
                ? { ...contract.customPoaAttachment, fileDataUrl: undefined }
                : undefined,
            },
            lawyer_name: contract.lawyerName,
            lawyer_oab: contract.lawyerOab,
            office_name: contract.officeName,
            physical_signed_status: contract.physicalSignedStatus,
            physical_file_location: contract.physicalFileLocation,
            is_custom_edited: contract.isCustomEdited || false,
            custom_edited_by: contract.customEditedBy,
            custom_edited_at: contract.customEditedAt,
            custom_contract_body: contract.customContractBody,
            custom_poa_body: contract.customPoaBody,
            issued_at: contract.issuedAt,
          },
          { onConflict: 'tenant_id,contract_number' }
        );

        // 2. Audit log into attendances table
        await (supabase.from('attendances') as any).insert({
          tenant_id: contract.tenantId,
          client_id: contract.clientId,
          attendance_type: 'OTHER',
          objective: `${actionTitle}: ${contract.contractNumber}`,
          notes: actionDetail,
          attended_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Supabase persistence/audit skipped (using local mock store):', err);
    }
  };

  // Attach physical document handler
  const handleAttachSigned = (
    contractId: string,
    attachment: PhysicalDocumentAttachment
  ) => {
    const updated = contractsStore.attachSignedPhysicalDocument(contractId, attachment);
    if (updated) {
      refreshData();
      triggerToast(t.contracts.uploadSuccessToast);

      // Persist to Supabase and log audit
      const categoryLabel =
        attachment.documentCategory === 'FEE_CONTRACT'
          ? 'Contrato de Honorários'
          : attachment.documentCategory === 'POWER_OF_ATTORNEY'
          ? 'Procuração Ad Judicia'
          : 'Documento da Advocacia';

      persistContractAndAudit(
        updated,
        'Documento Físico Assinado Vinculado',
        `Arquivo "${attachment.fileName}" (${attachment.fileSizeFormatted}) anexado por ${
          attachment.uploadedBy
        }. Finalidade: ${categoryLabel}. Local: ${attachment.physicalCabinetLocation}. Assinado: ${
          attachment.isSigned ? 'Sim' : 'Não'
        }.`
      );
    }
  };

  // Create contract handler
  const handleCreateContract = (
    contractData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const created = contractsStore.createContract(contractData);
    refreshData();
    triggerToast(`Contrato ${created.contractNumber} formalizado com sucesso!`);

    // Persist to Supabase and log audit
    const hasCustomDoc = Boolean(created.physicalAttachment);
    persistContractAndAudit(
      created,
      'Contrato Formalizado',
      `Contrato ${created.contractNumber} para ${created.clientName} (${created.benefitSpecies}). Regime: ${
        created.feeStructure.feeModel
      }. ${
        hasCustomDoc
          ? `Minuta customizada enviada: "${created.physicalAttachment?.fileName}" (${
              created.physicalAttachment?.isSigned ? 'Assinado' : 'Pendente de assinatura'
            }) por ${created.physicalAttachment?.replacedBy}.`
          : 'Minuta padrão do sistema vinculada.'
      }`
    );
  };

  // Add template handler
  const handleAddTemplate = (
    templateData: Omit<ContractTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const newTpl = contractsStore.addTemplate(templateData);
    refreshData();
    triggerToast(`Minuta "${newTpl.title}" cadastrada com sucesso!`);
  };

  // Update template handler
  const handleUpdateTemplate = (templateData: ContractTemplate) => {
    const updated = contractsStore.updateTemplate(templateData);
    if (updated) {
      refreshData();
      triggerToast(`Minuta "${updated.title}" atualizada com sucesso!`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#082A52] text-white rounded-xl shadow-xl border border-[#C89543]/40 animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#082A52]/10 text-[#082A52] border border-[#082A52]/20 mb-2">
            <Scale className="w-3.5 h-3.5 text-[#C89543]" />
            <span>Módulo de Gestão Contratual & Financeira OAB</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082A52] tracking-tight">
            {t.contracts.pageTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            {t.contracts.pageSubtitle}
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setSelectedTemplateForNewContract(null);
              setIsNewContractOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#082A52] to-[#0c3a6f] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all border border-[#C89543]/30"
          >
            <Plus className="w-4 h-4 text-[#C89543]" />
            <span>{t.contracts.btnNewContract}</span>
          </button>
        </div>
      </div>

      {/* Executive KPI Cards */}
      {kpis && <ContractsKpiCards kpis={kpis} />}

      {/* Main View Toggle Switcher */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setActiveViewTab('CONTRACTS')}
            className={`flex items-center gap-2 pb-3 text-sm font-bold transition-all relative ${
              activeViewTab === 'CONTRACTS'
                ? 'text-[#082A52] border-b-2 border-[#082A52]'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <CreditCard
              className={`w-4 h-4 ${
                activeViewTab === 'CONTRACTS' ? 'text-[#0B78D0]' : 'text-slate-400'
              }`}
            />
            <span>{t.contracts.tabContractsHub}</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-slate-100 text-slate-700">
              {contracts.length}
            </span>
          </button>

          {canAccess('templatesManage') && (
            <button
              type="button"
              onClick={() => setActiveViewTab('TEMPLATES')}
              className={`flex items-center gap-2 pb-3 text-sm font-bold transition-all relative ${
                activeViewTab === 'TEMPLATES'
                  ? 'text-[#082A52] border-b-2 border-[#082A52]'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <BookOpen
                className={`w-4 h-4 ${
                  activeViewTab === 'TEMPLATES' ? 'text-[#C89543]' : 'text-slate-400'
                }`}
              />
              <span>{t.contracts.tabOfficeTemplates}</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-amber-50 text-amber-800 border border-amber-200">
                {templates.length}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Active Tab Content */}
      {activeViewTab === 'CONTRACTS' || !canAccess('templatesManage') ? (
        <ContractsTable
          contracts={contracts}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onOpenInstallments={(contract) => {
            setSelectedContractForInstallments(contract);
            setIsInstallmentsOpen(true);
          }}
          onOpenPrint={(contract) => {
            setSelectedContractForPrint(contract);
            setIsPrintOpen(true);
          }}
          onOpenUpload={(contract) => {
            setSelectedContractForUpload(contract);
            setIsUploadOpen(true);
          }}
        />
      ) : (
        <TemplatesManagementView
          templates={templates}
          onSelectTemplateForNewContract={(template) => {
            setSelectedTemplateForNewContract(template);
            setIsNewContractOpen(true);
          }}
          onAddNewTemplate={handleAddTemplate}
          onUpdateTemplate={handleUpdateTemplate}
        />
      )}

      {/* Modals & Drawers */}
      <InstallmentsDrawerModal
        contract={selectedContractForInstallments}
        isOpen={isInstallmentsOpen}
        onClose={() => {
          setIsInstallmentsOpen(false);
          setSelectedContractForInstallments(null);
        }}
        onSettleInstallment={handleSettleInstallment}
      />

      <UploadSignedModal
        contract={selectedContractForUpload}
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
          setSelectedContractForUpload(null);
        }}
        onUploadSuccess={handleAttachSigned}
      />

      <ContractPrintModal
        contract={selectedContractForPrint}
        isOpen={isPrintOpen}
        onClose={() => {
          setIsPrintOpen(false);
          setSelectedContractForPrint(null);
        }}
      />

      <NewContractModal
        isOpen={isNewContractOpen}
        onClose={() => {
          setIsNewContractOpen(false);
          setSelectedTemplateForNewContract(null);
        }}
        templates={templates}
        selectedTemplateFromLibrary={selectedTemplateForNewContract}
        onContractCreated={handleCreateContract}
      />
    </div>
  );
}
