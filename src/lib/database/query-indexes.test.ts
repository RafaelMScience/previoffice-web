import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Item 17: Otimização de Índices para Consultas Comuns (Migration & EXPLAIN Coverage)', () => {
  const migrationPath = path.resolve(process.cwd(), 'supabase/migrations/20261121000008_optimize_common_query_indexes.sql');

  it('migration file exists and is readable', () => {
    assert.ok(fs.existsSync(migrationPath), 'Migration file must exist');
    const content = fs.readFileSync(migrationPath, 'utf8');
    assert.ok(content.length > 500, 'Migration file must contain detailed SQL indexes');
  });

  it('enables pg_trgm for accelerated text/autocomplete queries', () => {
    const content = fs.readFileSync(migrationPath, 'utf8');
    assert.ok(content.includes('CREATE EXTENSION IF NOT EXISTS pg_trgm;'), 'Must enable pg_trgm extension');
  });

  it('covers high-frequency Client queries with composite and trigram indexes', () => {
    const content = fs.readFileSync(migrationPath, 'utf8');
    // Tenant + status + created_at DESC
    assert.ok(content.includes('idx_clients_tenant_status_created'), 'Must index tenant_id, status, created_at DESC');
    // Trigram search on normalized_name
    assert.ok(content.includes('idx_clients_name_trgm'), 'Must create GIN trigram index on normalized_name');
    // Tenant + normalized_cpf
    assert.ok(content.includes('idx_clients_tenant_cpf'), 'Must index tenant_id, normalized_cpf');
  });

  it('covers Attendance history and workload queries', () => {
    const content = fs.readFileSync(migrationPath, 'utf8');
    assert.ok(content.includes('idx_attendances_tenant_client_attended'), 'Must index tenant_id, client_id, attended_at DESC');
    assert.ok(content.includes('idx_attendances_tenant_attendant_attended'), 'Must index tenant_id, attendant_user_id, attended_at DESC');
  });

  it('covers Document vault queries and category filtering', () => {
    const content = fs.readFileSync(migrationPath, 'utf8');
    assert.ok(content.includes('idx_documents_tenant_client_created'), 'Must index tenant_id, client_id, created_at DESC');
    assert.ok(content.includes('idx_documents_tenant_client_category'), 'Must index tenant_id, client_id, category');
  });

  it('covers Contracts dashboard, client lookup, and status filtering', () => {
    const content = fs.readFileSync(migrationPath, 'utf8');
    assert.ok(content.includes('idx_contracts_tenant_created'), 'Must index tenant_id, created_at DESC');
    assert.ok(content.includes('idx_contracts_tenant_client_created'), 'Must index tenant_id, client_id, created_at DESC');
    assert.ok(content.includes('idx_contracts_tenant_status_created'), 'Must index tenant_id, status, created_at DESC');
  });

  it('covers Profiles team role filtering and OAB verification', () => {
    const content = fs.readFileSync(migrationPath, 'utf8');
    assert.ok(content.includes('idx_profiles_tenant_role_active'), 'Must index tenant_id, role with active filter');
    assert.ok(content.includes('idx_profiles_oab_lookup'), 'Must index oab_state, oab_number');
  });
});
