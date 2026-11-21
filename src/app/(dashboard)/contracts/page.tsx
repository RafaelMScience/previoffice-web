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
import {
  fetchContractsFromDb,
  saveContractToDb,
  updateContractSignedStatusInDb,
  settleContractInstallmentInDb,
  calculateContractKpis,
  fetchContractTemplates,
} from '@/lib/services/contract-service';

import { ContractsKpiCards } from '@/components/contracts/contracts-kpi-cards';
import {
  ContractsKpiCardsSkeleton,
  ContractsTableSkeleton,
} from '@/components/contracts/contracts-skeleton';
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
  const { canAccess, currentUser } = useAuth();

  // Core Data State
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [kpis, setKpis] = useState<ContractKpis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const tenantId = currentUser?.tenantId || '';
      const loadedContracts = await fetchContractsFromDb(tenantId);
      const loadedTemplates = await fetchContractTemplates(tenantId);
      setContracts(loadedContracts);
      setTemplates(loadedTemplates);
      setKpis(calculateContractKpis(loadedContracts));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [currentUser?.tenantId]);

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
  const handleSettleInstallment = async (
    contractId: string,
    installmentId: string,
    paymentMethod: PaymentMethod,
    receiptReference?: string,
    notes?: string
  ) => {
    const tenantId = currentUser?.tenantId || '';
    const updated = await settleContractInstallmentInDb(
      contractId,
      tenantId,
      installmentId,
      paymentMethod,
      receiptReference,
      notes
    );
    if (updated) {
      await refreshData();
      setSelectedContractForInstallments(updated);
      triggerToast(t.contracts.settleSuccessToast);
    }
  };

  // Attach physical document handler
  const handleAttachSigned = async (
    contractId: string,
    attachment: PhysicalDocumentAttachment
  ) => {
    const tenantId = currentUser?.tenantId || '';
    await updateContractSignedStatusInDb(contractId, tenantId, 'ATTACHED', attachment);
    await refreshData();
    triggerToast(t.contracts.uploadSuccessToast);
  };

  // Create contract handler
  const handleCreateContract = async (
    contractData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const created = contractsStore.createContract(contractData);
    await saveContractToDb(created);
    await refreshData();
    triggerToast(`Contrato ${created.contractNumber} formalizado com sucesso!`);
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
      {isLoading ? (
        <ContractsKpiCardsSkeleton />
      ) : (
        kpis && <ContractsKpiCards kpis={kpis} />
      )}

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
      {isLoading ? (
        <ContractsTableSkeleton />
      ) : activeViewTab === 'CONTRACTS' || !canAccess('templatesManage') ? (
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
