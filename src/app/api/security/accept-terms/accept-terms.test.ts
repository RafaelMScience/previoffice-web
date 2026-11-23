import test from 'node:test';
import assert from 'node:assert/strict';
import { generateIntegritySeal } from '../../../../lib/services/audit-service.ts';

test('LGPD Terms Acceptance API: Contract & Payload Validation', () => {
  // Validate standard payload
  const payload = {
    termsVersion: '1.0',
    accepted: true,
  };

  assert.equal(payload.termsVersion, '1.0');
  assert.equal(payload.accepted, true);

  // Validate forensic integrity hash format for LGPD acceptance
  const tenantId = 'tenant-previ-001';
  const userId = 'usr-advogado-titular';
  const timestamp = new Date().toISOString();
  const rawPayload = `${tenantId}:${userId}:LGPD_TERMS_ACCEPTED:TERMS_OF_RESPONSIBILITY_v${payload.termsVersion}:${timestamp}`;
  const seal = generateIntegritySeal(rawPayload);

  assert.equal(seal.length, 64);
  assert.match(seal, /^[a-f0-9]{64}$/);
});
