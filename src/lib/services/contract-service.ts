/**
 * Contract Service & Domain Facade
 * Provides high-level contract management methods to Next.js components.
 * Delegates data access to IContractRepository implementations.
 */

import type { IContractRepository } from '../repositories/contract-repository.ts';
import { SupabaseContractRepository } from '../repositories/supabase-contract-repository.ts';
import { MockContractRepository } from '../repositories/mock-contract-repository.ts';
import { dedupeRequest, invalidateCache } from '../cache/request-cache.ts';
import type {
  Contract,
  ContractKpis,
  ContractTemplate,
  PaymentMethod,
  PhysicalDocumentAttachment,
  PhysicalSignedStatus,
} from '../../types/contract.ts';

let activeRepository: IContractRepository | null = null;

/**
 * Repository Factory.
 * Selects Supabase when running in browser/server with Supabase credentials,
 * with graceful fallback to Mock for offline testing.
 */
export function getContractRepository(): IContractRepository {
  if (activeRepository) return activeRepository;

  const hasSupabase =
    typeof process !== 'undefined' &&
    Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

  if (hasSupabase) {
    activeRepository = new SupabaseContractRepository();
  } else {
    activeRepository = new MockContractRepository();
  }

  return activeRepository;
}

/**
 * Set custom repository (ideal for unit tests or database engine swap).
 */
export function setContractRepository(repo: IContractRepository) {
  activeRepository = repo;
}

/**
 * Fetch contracts for a given tenant.
 * Falls back to local storage if database yields 0 or fails.
 */
export async function fetchContractsFromDb(tenantId: string): Promise<Contract[]> {
  return dedupeRequest(`contracts:list:${tenantId}`, async () => {
    const repo = getContractRepository();
    try {
      const dbContracts = await repo.fetchContracts(tenantId);
      if (dbContracts.length > 0) {
        return dbContracts;
      }
    } catch (err) {
      console.warn('Database fetch failed, falling back to local store:', err);
    }

    // Graceful fallback to local mock store
    const mockRepo = new MockContractRepository();
    return mockRepo.fetchContracts(tenantId);
  }, { ttlMs: 10000 });
}

/**
 * Save contract to database and sync local store.
 */
export async function saveContractToDb(contract: Contract): Promise<void> {
  const repo = getContractRepository();
  try {
    await repo.saveContract(contract);
  } catch (err) {
    console.warn('Could not persist to database, saving to local store:', err);
  }

  // Always keep mock store in sync for seamless offline/hybrid operation
  const mockRepo = new MockContractRepository();
  await mockRepo.saveContract(contract);
  invalidateCache('contracts:');
}

/**
 * Update signed document status and link scanned physical attachment.
 */
export async function updateContractSignedStatusInDb(
  contractId: string,
  tenantId: string,
  status: PhysicalSignedStatus,
  attachment?: PhysicalDocumentAttachment
): Promise<void> {
  const repo = getContractRepository();
  try {
    await repo.updatePhysicalSignedStatus(contractId, tenantId, status, attachment);
  } catch (err) {
    console.warn('Failed to update signed status in DB:', err);
  }

  const mockRepo = new MockContractRepository();
  await mockRepo.updatePhysicalSignedStatus(contractId, tenantId, status, attachment);
  invalidateCache('contracts:');
}

/**
 * Settle installment payment.
 */
export async function settleContractInstallmentInDb(
  contractId: string,
  tenantId: string,
  installmentId: string,
  paymentMethod: PaymentMethod,
  receiptReference?: string,
  notes?: string
): Promise<Contract | null> {
  const repo = getContractRepository();
  let updated: Contract | null = null;
  try {
    updated = await repo.settleInstallment(
      contractId,
      tenantId,
      installmentId,
      paymentMethod,
      receiptReference,
      notes
    );
  } catch (err) {
    console.warn('Failed to settle installment in DB:', err);
  }

  const mockRepo = new MockContractRepository();
  const mockUpdated = await mockRepo.settleInstallment(
    contractId,
    tenantId,
    installmentId,
    paymentMethod,
    receiptReference,
    notes
  );

  invalidateCache('contracts:');
  return updated || mockUpdated;
}

/**
 * Pure domain calculator for Contract KPIs from a list of contracts.
 */
export function calculateContractKpis(contracts: Contract[]): ContractKpis {
  let totalContractedAmount = 0;
  let estimatedSuccessReceivables = 0;
  let openInstallmentsCount = 0;
  let openInstallmentsAmount = 0;
  let overdueInstallmentsCount = 0;
  let signedPhysicalCount = 0;

  const nowIso = new Date().toISOString().split('T')[0];

  for (const c of contracts) {
    const fee = c.feeStructure;

    if (fee.feeModel === 'QUOTA_LITIS' || fee.feeModel === 'HYBRID') {
      estimatedSuccessReceivables += fee.estimatedSuccessFeeAmount || 0;
      totalContractedAmount += fee.estimatedSuccessFeeAmount || 0;
    }

    if (fee.feeModel === 'FIXED_INSTALLMENT' || fee.feeModel === 'HYBRID') {
      totalContractedAmount += fee.fixedTotalAmount || 0;
    }

    if (c.physicalSignedStatus === 'ATTACHED') {
      signedPhysicalCount++;
    }

    if (fee.installments) {
      for (const inst of fee.installments) {
        if (inst.status === 'PENDING') {
          openInstallmentsCount++;
          openInstallmentsAmount += inst.amount;
          if (inst.dueDate < nowIso) {
            overdueInstallmentsCount++;
          }
        } else if (inst.status === 'OVERDUE') {
          openInstallmentsCount++;
          openInstallmentsAmount += inst.amount;
          overdueInstallmentsCount++;
        }
      }
    }
  }

  const totalContractsCount = contracts.length;
  const signedPhysicalAttachedRate =
    totalContractsCount > 0
      ? Math.round((signedPhysicalCount / totalContractsCount) * 100)
      : 0;

  return {
    totalContractedAmount,
    estimatedSuccessReceivables,
    openInstallmentsCount,
    openInstallmentsAmount,
    overdueInstallmentsCount,
    signedPhysicalAttachedRate,
    signedPhysicalCount,
    totalContractsCount,
  };
}

/**
 * Fetch contract templates.
 */
export async function fetchContractTemplates(tenantId: string): Promise<ContractTemplate[]> {
  return dedupeRequest(`templates:list:${tenantId}`, async () => {
    const repo = getContractRepository();
    return repo.fetchTemplates(tenantId);
  }, { ttlMs: 60000 });
}
