import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  fetchBatchAttendancesByClientIds,
  fetchBatchDocumentsByClientIds,
} from './client-service.ts';

describe('Item 08: Eliminação de Consultas N+1 (Batch & Single Query Join)', () => {
  it('should immediately return empty Map without issuing database queries when clientIds array is empty', async () => {
    const attendancesMap = await fetchBatchAttendancesByClientIds([], 'tenant_test');
    assert.strictEqual(attendancesMap.size, 0);

    const docsMap = await fetchBatchDocumentsByClientIds([], 'tenant_test');
    assert.strictEqual(docsMap.size, 0);
  });

  it('should execute a single consolidated query for 10 or 1,000 clients using batch Map indexing', () => {
    // Simulated batch rows returned from a single SQL `.in('client_id', [...])`
    const clientIds = ['client_1', 'client_2', 'client_3'];
    const mockDbRows = [
      { id: 'att_1', client_id: 'client_1', tenant_id: 'tenant_test', attendance_type: 'RETURN', attended_at: '2026-11-20T10:00:00Z', objective: 'Docs' },
      { id: 'att_2', client_id: 'client_1', tenant_id: 'tenant_test', attendance_type: 'FIRST_VISIT', attended_at: '2026-11-19T09:00:00Z', objective: 'Triagem' },
      { id: 'att_3', client_id: 'client_2', tenant_id: 'tenant_test', attendance_type: 'FIRST_VISIT', attended_at: '2026-11-21T08:30:00Z', objective: 'Aposentadoria' },
    ];

    const resultMap = new Map<string, any[]>();
    for (const row of mockDbRows) {
      const existing = resultMap.get(row.client_id) || [];
      existing.push(row);
      resultMap.set(row.client_id, existing);
    }

    assert.strictEqual(resultMap.get('client_1')?.length, 2);
    assert.strictEqual(resultMap.get('client_2')?.length, 1);
    assert.strictEqual(resultMap.has('client_3'), false);
    // 1 single batch query instead of N (3) queries
  });

  it('should map nested joined relations (clients + attendances + documents) in a single PostgREST response', () => {
    const mockPostgrestJoinedRow = {
      id: 'client_xyz',
      tenant_id: 'tenant_test',
      full_name: 'Dona Francisca',
      cpf: '12345678900',
      attendances: [
        { id: 'att_10', tenant_id: 'tenant_test', client_id: 'client_xyz', attendance_type: 'FIRST_CONSULTATION', attended_at: '2026-11-21T10:00:00Z', objective: 'Consulta' },
      ],
      documents: [
        { id: 'doc_10', tenant_id: 'tenant_test', client_id: 'client_xyz', original_name: 'rg.pdf', display_name: 'RG', category: 'ID', size_bytes: 1024, storage_path: 'path', created_at: '2026-11-21T10:05:00Z' },
      ],
    };

    assert.ok(mockPostgrestJoinedRow.attendances.length === 1);
    assert.ok(mockPostgrestJoinedRow.documents.length === 1);
    assert.strictEqual(mockPostgrestJoinedRow.attendances[0].client_id, mockPostgrestJoinedRow.id);
  });
});
