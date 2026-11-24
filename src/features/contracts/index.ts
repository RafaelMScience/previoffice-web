/**
 * Feature Module: Contracts & Minutas OAB (PreviOffice)
 * Encapsulates legal contract generation, remuneration models (Quota Litis, Carnê, Híbrido),
 * dynamic A4 sheet previews, batch issuance, and contract print engines.
 */

export { LegalContractModal } from '@/components/client-details/legal-contract-modal';
export { ContractRegimeSelector } from '@/components/client-details/contract-modal/contract-regime-selector';
export { ContractParametersSidebar } from '@/components/client-details/contract-modal/contract-parameters-sidebar';
export { ContractDocumentList } from '@/components/client-details/contract-modal/contract-document-list';
export { ContractPreviewSheet } from '@/components/client-details/contract-modal/contract-preview-sheet';
export { printSingleContract, printBatchContracts } from '@/components/client-details/contract-modal/contract-printer';

// Modals & Management Views
export { ContractPrintModal } from '@/components/contracts/contract-print-modal';
export { NewContractModal } from '@/components/contracts/new-contract-modal';
export { TemplatesManagementView } from '@/components/contracts/templates-management-view';

// Domain Types
export type { ContractTemplate, FeeModel, DocumentCategory, Contract } from '@/types/contract';
export type { GeneratedDocItem } from '@/components/client-details/legal-contract-modal';
