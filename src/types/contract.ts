/**
 * Contract & Legal Fee Management Domain Types
 * Strictly in English. Maps to PostgreSQL Supabase and Drift mobile schemas.
 */

export type ContractStatus =
  | 'DRAFT'               // Drafted but not issued to client
  | 'PENDING_SIGNATURE'   // Issued, awaiting client signature (digital or physical)
  | 'ACTIVE'              // Signed, active legal/administrative representation
  | 'CONCLUDED'           // Benefício concedido, fees collected, case archived
  | 'CANCELLED';          // Terminated or revoked

export type FeeModel =
  | 'QUOTA_LITIS'         // Contingent success fee (% over retroactives / atrasados)
  | 'FIXED_INSTALLMENT'   // Fixed amount divided into installments (e.g. Entrada + X parcelas)
  | 'HYBRID';             // Combination of fixed installment + success percentage

export type PhysicalSignedStatus =
  | 'PENDING'             // Awaiting scan or paper return
  | 'ATTACHED'            // Scanned signed document uploaded and linked to physical archive
  | 'NOT_APPLICABLE';     // Digital-only e-signature

export type PaymentMethod =
  | 'PIX'
  | 'BOLETO'
  | 'CASH'
  | 'CREDIT_CARD'
  | 'BANK_TRANSFER'
  | 'RPV_PRECATORIO_RETENTION'; // Retenção direta de honorários destacados na RPV/Precatório

export type InstallmentStatus =
  | 'PENDING'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED';

export interface FeeInstallment {
  id: string;
  contractId: string;
  installmentNumber: number;
  dueDate: string;              // ISO date (YYYY-MM-DD)
  amount: number;               // Monetary value in BRL
  status: InstallmentStatus;
  paidAt?: string;              // ISO datetime
  paymentMethod?: PaymentMethod;
  receiptReference?: string;    // Receipt number or Pix transaction ID
  notes?: string;
}

export interface ContractFeeStructure {
  feeModel: FeeModel;
  
  // Quota Litis (Success Fee) Configuration
  quotaLitisPercentage?: number;          // e.g. 30 (representing 30%)
  estimatedRetroactiveAmount?: number;   // Estimated atrasados / cause value (e.g. 45000)
  estimatedSuccessFeeAmount?: number;    // Projected fee = retroactives * percentage (e.g. 13500)
  actualSuccessFeeReceived?: number;     // Realized fee collected upon INSS grant
  
  // Fixed / Installment Configuration
  fixedTotalAmount?: number;             // Total fixed fee (e.g. 1800)
  downPaymentAmount?: number;            // Entrada paga à vista (e.g. 300)
  installmentCount?: number;             // Number of installments (e.g. 5)
  isSettled?: boolean;                   // True when all installments or fixed fees are fully paid (dívida finalizada)
  installments: FeeInstallment[];
}

export interface PhysicalDocumentAttachment {
  id: string;
  fileName: string;
  fileSizeFormatted: string;
  fileType: string;                      // 'application/pdf' | 'image/jpeg' | 'image/png'
  uploadedAt: string;                    // ISO datetime
  uploadedBy: string;                    // Lawyer or receptionist name
  physicalCabinetLocation: string;       // e.g. "Armário B - Gaveta 03 - Pasta 2026-042"
  signerType: 'CLIENT_SIGNATURE' | 'ROGO_WITNESSES' | 'LEGAL_REPRESENTATIVE';
  notes?: string;
  downloadUrl?: string;
  // Custom document replacement & category fields:
  documentCategory?: 'FEE_CONTRACT' | 'POWER_OF_ATTORNEY' | 'OTHER';
  isSigned?: boolean;
  fileDataUrl?: string;
  replacedAt?: string;
  replacedBy?: string;
}

export type DocumentCategory =
  | 'FEE_CONTRACT'          // Contrato de Honorários Advocatícios
  | 'POWER_OF_ATTORNEY'     // Procuração Ad Judicia et Extra
  | 'DECLARATION_HIPO'      // Declaração de Hipossuficiência Econômica
  | 'WAIVER_TERM'           // Termo de Renúncia / Desistência
  | 'INSS_REQUEST'          // Requerimento Administrativo INSS
  | 'OTHER';                // Outro Tipo Personalizado

export interface ContractTemplate {
  id: string;
  tenantId: string;
  title: string;
  documentCategory?: DocumentCategory;
  customCategoryName?: string;          // Nome livre caso documentCategory seja 'OTHER'
  benefitSpecies: string;                // e.g. "Aposentadoria Rural", "BPC/LOAS", "Pensão por Morte"
  description: string;
  defaultFeeModel: FeeModel;
  defaultQuotaLitisPercentage: number;   // Usually 30% for social security
  clausesCount: number;
  isDefault: boolean;
  lawyerName?: string;                   // Opcional: só salvo se o usuário preencher explicitamente
  lawyerOab?: string;                    // e.g. "OAB/AM 55.858"
  contentBody: string;                   // Markdown or standard template text with dynamic placeholders
  createdAt: string;
  updatedAt: string;
}

export interface Contract {
  id: string;
  tenantId: string;
  contractNumber: string;                // e.g. "CTR-2026-081"
  clientId: string;
  clientName: string;
  clientCpf: string;
  clientPhone?: string;
  benefitSpecies: string;
  templateId?: string;
  templateTitle?: string;
  
  status: ContractStatus;
  physicalSignedStatus: PhysicalSignedStatus;
  physicalAttachment?: PhysicalDocumentAttachment;
  customContractAttachment?: PhysicalDocumentAttachment;
  customPoaAttachment?: PhysicalDocumentAttachment;
  customDocuments?: PhysicalDocumentAttachment[];
  feeStructure: ContractFeeStructure;
  
  lawyerName: string;                    // e.g. "Dr. Carlos Eduardo Silva"
  lawyerOab: string;                     // e.g. "OAB/AM 55.858"
  officeName: string;
  
  issuedAt: string;                      // ISO datetime
  signedAt?: string;
  concludedAt?: string;
  physicalFileLocation: string;          // Office cabinet folder index
  notes?: string;

  // Custom clause editing audit
  isCustomEdited?: boolean;
  customEditedBy?: string;
  customEditedAt?: string;
  customContractBody?: string;
  customPoaBody?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface ContractKpis {
  totalContractedAmount: number;         // Total fixed contracted fees + quota litis projections
  estimatedSuccessReceivables: number;   // Total future quota litis pipeline to be received
  openInstallmentsCount: number;         // Number of pending + overdue installments
  openInstallmentsAmount: number;        // Sum in BRL of pending installments
  overdueInstallmentsCount: number;      // Urgent overdue count
  signedPhysicalAttachedRate: number;    // Percentage (0 to 100)
  signedPhysicalCount: number;           // Contracts with physical scan attached
  totalContractsCount: number;
}
