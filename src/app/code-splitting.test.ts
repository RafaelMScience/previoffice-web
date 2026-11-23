import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Item 22: Divisão de JavaScript por Página e Carregamento Sob Demanda de Modais', () => {
  it('contracts page dynamically imports heavy modals and subviews', () => {
    const contractsPagePath = path.resolve(process.cwd(), 'src/app/(dashboard)/contracts/page.tsx');
    const content = fs.readFileSync(contractsPagePath, 'utf8');

    assert.ok(content.includes("from 'next/dynamic'"), 'ContractsPage must use next/dynamic');
    assert.ok(content.includes('InstallmentsDrawerModal = dynamic('), 'InstallmentsDrawerModal must be dynamic');
    assert.ok(content.includes('UploadSignedModal = dynamic('), 'UploadSignedModal must be dynamic');
    assert.ok(content.includes('ContractPrintModal = dynamic('), 'ContractPrintModal must be dynamic');
    assert.ok(content.includes('TemplatesManagementView = dynamic('), 'TemplatesManagementView must be dynamic');
    assert.ok(content.includes('NewContractModal = dynamic('), 'NewContractModal must be dynamic');
  });

  it('dashboard reception page dynamically imports memory card and fast intake modals', () => {
    const dashboardPagePath = path.resolve(process.cwd(), 'src/app/(dashboard)/page.tsx');
    const content = fs.readFileSync(dashboardPagePath, 'utf8');

    assert.ok(content.includes("from 'next/dynamic'"), 'DashboardPage must use next/dynamic');
    assert.ok(content.includes('MemoryCardModal = dynamic('), 'MemoryCardModal must be dynamic');
    assert.ok(content.includes('FastIntakeModal = dynamic('), 'FastIntakeModal must be dynamic');
  });

  it('client details view dynamically imports legal contract, attendance, and report modals', () => {
    const clientDetailsPath = path.resolve(process.cwd(), 'src/components/client-details/client-details-view.tsx');
    const content = fs.readFileSync(clientDetailsPath, 'utf8');

    assert.ok(content.includes("from 'next/dynamic'"), 'ClientDetailsView must use next/dynamic');
    assert.ok(content.includes('LegalContractModal = dynamic('), 'LegalContractModal must be dynamic');
    assert.ok(content.includes('ClientPdfReportModal = dynamic('), 'ClientPdfReportModal must be dynamic');
    assert.ok(content.includes('NewAttendanceModal = dynamic('), 'NewAttendanceModal must be dynamic');
  });
});
