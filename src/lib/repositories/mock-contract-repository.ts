/**
 * Mock & LocalStorage Contract Repository Implementation
 * Ideal for offline development, local demos, and unit testing.
 */

import type { IContractRepository } from './contract-repository.ts';
import type {
  Contract,
  ContractTemplate,
  PhysicalDocumentAttachment,
  PhysicalSignedStatus,
  PaymentMethod,
} from '../../types/contract.ts';
import { contractsStore } from '../data/mock-contracts.ts';

export class MockContractRepository implements IContractRepository {
  async fetchContracts(tenantId: string): Promise<Contract[]> {
    const all = contractsStore.getContracts();
    const tenantContracts = all.filter((c) => !tenantId || c.tenantId === tenantId);
    if (tenantContracts.length === 0) {
      // Return standard default contracts if this tenant has not registered contracts yet
      return all;
    }
    return tenantContracts;
  }

  async getContractById(id: string, tenantId: string): Promise<Contract | null> {
    const contracts = await this.fetchContracts(tenantId);
    return contracts.find((c) => c.id === id) || null;
  }

  async saveContract(contract: Contract): Promise<void> {
    const all = contractsStore.getContracts();
    const idx = all.findIndex(
      (c) => c.id === contract.id || c.contractNumber === contract.contractNumber
    );

    if (idx !== -1) {
      const updatedList = [...all];
      updatedList[idx] = {
        ...contract,
        updatedAt: new Date().toISOString(),
      };
      (contractsStore as any).contracts = updatedList;
      (contractsStore as any).saveToStorage();
    } else {
      (contractsStore as any).contracts = [contract, ...all];
      (contractsStore as any).saveToStorage();
    }
  }

  async updatePhysicalSignedStatus(
    contractId: string,
    tenantId: string,
    status: PhysicalSignedStatus,
    attachment?: PhysicalDocumentAttachment
  ): Promise<void> {
    if (attachment) {
      contractsStore.attachSignedPhysicalDocument(contractId, attachment);
    }
  }

  async settleInstallment(
    contractId: string,
    tenantId: string,
    installmentId: string,
    paymentMethod: PaymentMethod,
    receiptReference?: string,
    notes?: string
  ): Promise<Contract | null> {
    return (
      contractsStore.settleInstallment(
        contractId,
        installmentId,
        paymentMethod,
        receiptReference,
        notes
      ) || null
    );
  }

  async fetchTemplates(tenantId: string): Promise<ContractTemplate[]> {
    const all = contractsStore.getTemplates();
    return all.filter(
      (t) =>
        !tenantId ||
        t.tenantId === tenantId ||
        t.isDefault ||
        t.tenantId === 'tenant-001' ||
        t.tenantId === 'system'
    );
  }

  async saveTemplate(template: ContractTemplate): Promise<void> {
    const updated = contractsStore.updateTemplate(template);
    if (!updated) {
      contractsStore.addTemplate(template);
    }
  }
}
