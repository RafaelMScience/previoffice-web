import test from 'node:test';
import assert from 'node:assert/strict';
import { generateIntegritySeal } from '../lib/services/audit-service.ts';
import type { AuditAction } from './security.ts';

test('Security & Audit Types: LGPD and Session Lock Actions', () => {
  const actions: AuditAction[] = [
    'LGPD_TERMS_ACCEPTED',
    'SESSION_LOCKED_INACTIVITY',
    'SESSION_UNLOCKED',
  ];

  assert.equal(actions.length, 3);
  assert.ok(actions.includes('LGPD_TERMS_ACCEPTED'));
  assert.ok(actions.includes('SESSION_LOCKED_INACTIVITY'));
  assert.ok(actions.includes('SESSION_UNLOCKED'));

  // Test integrity seal generation with LGPD payload
  const payload = `tenant-123:user-456:LGPD_TERMS_ACCEPTED:terms-v1.0:2026-11-23T12:00:00Z`;
  const seal = generateIntegritySeal(payload);
  assert.equal(seal.length, 64);
  assert.match(seal, /^[0-9a-f]{64}$/);
});
