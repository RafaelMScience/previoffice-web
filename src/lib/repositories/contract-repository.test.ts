import { test, describe } from 'node:test';
import assert from 'node:assert';
import { MockContractRepository } from './mock-contract-repository.ts';
import {
  calculateContractKpis,
  getContractRepository,
  setContractRepository,
  fetchContractsFromDb,
} from '../services/contract-service.ts';
import type { Contract } from '@/types/contract';

describe('Contract Repository & Service Layer (Hexagonal Architecture)', () => {
  const sampleContract: Contract = {
    id: 'test-contract-001',
    tenantId: 'tenant-sample',
    contractNumber: 'CTR-2026-999',
    clientId: '00000000-0000-0000-0000-000000000001',
    clientName: 'João da Silva Teste',
    clientCpf: '111.222.333-44',
    benefitSpecies: 'Aposentadoria por Idade Rural',
    status: 'ACTIVE',
    physicalSignedStatus: 'PENDING',
    feeStructure: {
      feeModel: 'QUOTA_LITIS',
      quotaLitisPercentage: 30,
      estimatedRetroactiveAmount: 30000,
      estimatedSuccessFeeAmount: 9000,
      installments: [],
    },
    lawyerName: 'Dr. Alexandre Pontes',
    lawyerOab: 'OAB/PB 18.234',
    officeName: 'Alexandre Pontes Sociedade de Advogados',
    issuedAt: '2026-11-20T10:00:00Z',
    physicalFileLocation: 'Armário A - Gaveta 01',
    createdAt: '2026-11-20T10:00:00Z',
    updatedAt: '2026-11-20T10:00:00Z',
  };

  test('MockContractRepository should persist and retrieve contracts', async () => {
    const repo = new MockContractRepository();
    await repo.saveContract(sampleContract);

    const contracts = await repo.fetchContracts('tenant-sample');
    const found = contracts.find((c) => c.id === 'test-contract-001');

    assert.ok(found, 'Contract should be found in mock repo');
    assert.strictEqual(found.contractNumber, 'CTR-2026-999');
    assert.strictEqual(found.clientName, 'João da Silva Teste');
  });

  test('MockContractRepository should update physical signed status and link document', async () => {
    const repo = new MockContractRepository();
    await repo.updatePhysicalSignedStatus(
      'test-contract-001',
      'tenant-sample',
      'ATTACHED',
      {
        id: 'doc-001',
        fileName: 'contrato_assinado.pdf',
        fileSizeFormatted: '1.2 MB',
        fileType: 'application/pdf',
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'Dr. Alexandre',
        physicalCabinetLocation: 'Armário A - Gaveta 01',
        signerType: 'CLIENT_SIGNATURE',
        isSigned: true,
      }
    );

    const updated = await repo.getContractById('test-contract-001', 'tenant-sample');
    assert.ok(updated, 'Contract should exist');
    assert.strictEqual(updated.physicalSignedStatus, 'ATTACHED');
    assert.ok(updated.physicalAttachment, 'Attachment should be linked');
    assert.strictEqual(updated.physicalAttachment.fileName, 'contrato_assinado.pdf');
  });

  test('calculateContractKpis should accurately compute financial metrics and ratios', () => {
    const contracts: Contract[] = [
      {
        ...sampleContract,
        id: 'c-1',
        physicalSignedStatus: 'ATTACHED',
        feeStructure: {
          feeModel: 'QUOTA_LITIS',
          estimatedSuccessFeeAmount: 10000,
          installments: [],
        },
      },
      {
        ...sampleContract,
        id: 'c-2',
        physicalSignedStatus: 'PENDING',
        feeStructure: {
          feeModel: 'FIXED_INSTALLMENT',
          fixedTotalAmount: 2000,
          installments: [
            {
              id: 'inst-1',
              contractId: 'c-2',
              installmentNumber: 1,
              dueDate: '2026-01-01', // Overdue
              amount: 1000,
              status: 'OVERDUE',
            },
            {
              id: 'inst-2',
              contractId: 'c-2',
              installmentNumber: 2,
              dueDate: '2099-01-01', // Future
              amount: 1000,
              status: 'PENDING',
            },
          ],
        },
      },
    ];

    const kpis = calculateContractKpis(contracts);

    assert.strictEqual(kpis.totalContractsCount, 2);
    assert.strictEqual(kpis.signedPhysicalCount, 1);
    assert.strictEqual(kpis.signedPhysicalAttachedRate, 50); // 1 of 2 = 50%
    assert.strictEqual(kpis.estimatedSuccessReceivables, 10000);
    assert.strictEqual(kpis.totalContractedAmount, 12000); // 10000 + 2000
    assert.strictEqual(kpis.openInstallmentsCount, 2);
    assert.strictEqual(kpis.openInstallmentsAmount, 2000);
    assert.strictEqual(kpis.overdueInstallmentsCount, 1);
  });

  test('Dependency Injection via setContractRepository works cleanly', async () => {
    const customMock = new MockContractRepository();
    setContractRepository(customMock);

    const active = getContractRepository();
    assert.strictEqual(active, customMock);

    const contracts = await fetchContractsFromDb('tenant-sample');
    assert.ok(Array.isArray(contracts));
  });
});
