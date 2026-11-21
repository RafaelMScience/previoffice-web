import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Item 24: Projeção de Colunas Estritas (Eliminação de SELECT * e Textos Pesados)', () => {
  it('client-service.ts omits heavy text blobs and encrypted fields in client listings (fetchClientsFromDb)', () => {
    const filePath = path.resolve(process.cwd(), 'src/lib/services/client-service.ts');
    const content = fs.readFileSync(filePath, 'utf8');

    // Extract only the .select(...) call inside fetchClientsFromDb
    const fnStart = content.indexOf('export async function fetchClientsFromDb');
    const selectStart = content.indexOf('.select(', fnStart);
    const selectEnd = content.indexOf(')', selectStart + 10);
    const selectQuery = content.substring(selectStart, selectEnd);

    assert.ok(!selectQuery.includes('*'), 'fetchClientsFromDb must not select * for clients');
    assert.ok(selectQuery.includes('id, tenant_id, full_name, normalized_name, cpf'), 'Must project explicit client fields');
    assert.ok(!selectQuery.includes('encrypted_inss_password'), 'Must omit encrypted_inss_password in listing query');
    assert.ok(!selectQuery.includes('notes'), 'Must omit notes in listing query');
    assert.ok(!selectQuery.includes('recent_contributions_summary'), 'Must omit recent_contributions_summary in listing query');
  });

  it('supabase-contract-repository.ts omits heavy custom contract bodies in contract listings (fetchContracts)', () => {
    const filePath = path.resolve(process.cwd(), 'src/lib/repositories/supabase-contract-repository.ts');
    const content = fs.readFileSync(filePath, 'utf8');

    // Extract only the .select(...) call inside fetchContracts
    const fnStart = content.indexOf('async fetchContracts(tenantId: string)');
    const selectStart = content.indexOf('.select(', fnStart);
    const selectEnd = content.indexOf(')', selectStart + 10);
    const selectQuery = content.substring(selectStart, selectEnd);

    assert.ok(!selectQuery.includes('custom_contract_body'), 'Must omit custom_contract_body in listing query');
    assert.ok(!selectQuery.includes('custom_poa_body'), 'Must omit custom_poa_body in listing query');
    assert.ok(selectQuery.includes('id, tenant_id, client_id, contract_number'), 'Must project explicit contract listing fields');
  });

  it('batch attendance and document queries project explicit columns instead of *', () => {
    const filePath = path.resolve(process.cwd(), 'src/lib/services/client-service.ts');
    const content = fs.readFileSync(filePath, 'utf8');

    const attBatchStart = content.indexOf('export async function fetchBatchAttendancesByClientIds');
    const attSelect = content.substring(attBatchStart, attBatchStart + 250);
    assert.ok(!attSelect.includes(".select('*')"), 'Batch attendances must not select *');

    const docBatchStart = content.indexOf('export async function fetchBatchDocumentsByClientIds');
    const docSelect = content.substring(docBatchStart, docBatchStart + 250);
    assert.ok(!docSelect.includes(".select('*')"), 'Batch documents must not select *');
  });
});
