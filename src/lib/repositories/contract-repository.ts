/**
 * Contract Repository Interface (Port in Hexagonal / Clean Architecture)
 * Completely decoupled from database engines, ORMs, or third-party SDKs.
 */

import type {
  Contract,
  ContractTemplate,
  PhysicalDocumentAttachment,
  PhysicalSignedStatus,
  PaymentMethod,
} from '../../types/contract.ts';

export interface IContractRepository {
  /**
   * Fetch all contracts belonging to a specific tenant.
   */
  fetchContracts(tenantId: string): Promise<Contract[]>;

  /**
   * Fetch a single contract by its UUID and tenant.
   */
  getContractById(id: string, tenantId: string): Promise<Contract | null>;

  /**
   * Persist (create or update) a contract.
   */
  saveContract(contract: Contract): Promise<void>;

  /**
   * Update the physical signed status and link a scanned/custom document attachment.
   */
  updatePhysicalSignedStatus(
    contractId: string,
    tenantId: string,
    status: PhysicalSignedStatus,
    attachment?: PhysicalDocumentAttachment
  ): Promise<void>;

  /**
   * Settle an installment payment on a contract.
   */
  settleInstallment(
    contractId: string,
    tenantId: string,
    installmentId: string,
    paymentMethod: PaymentMethod,
    receiptReference?: string,
    notes?: string
  ): Promise<Contract | null>;

  /**
   * Fetch contract templates for the tenant.
   */
  fetchTemplates(tenantId: string): Promise<ContractTemplate[]>;

  /**
   * Persist a contract template.
   */
  saveTemplate(template: ContractTemplate): Promise<void>;
}
