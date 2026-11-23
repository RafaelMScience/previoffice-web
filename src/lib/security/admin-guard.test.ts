import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyMasterKey, checkRateLimit } from './admin-guard.ts';

test('Security Guard: verifyMasterKey Fail Closed Invariant', () => {
  const originalKey = process.env.MASTER_ADMIN_KEY;

  try {
    // 1. When MASTER_ADMIN_KEY is not defined, must fail closed
    delete process.env.MASTER_ADMIN_KEY;
    assert.equal(verifyMasterKey('any-key'), false);
    assert.equal(verifyMasterKey('po_adm_aLOMsQVEpXvRnbQZQZgnlKxJWrQaG6xg'), false);
    assert.equal(verifyMasterKey(''), false);

    // 2. When MASTER_ADMIN_KEY is defined
    process.env.MASTER_ADMIN_KEY = 'super_secret_master_test_key_2026';
    assert.equal(verifyMasterKey('super_secret_master_test_key_2026'), true);
    assert.equal(verifyMasterKey('wrong_key'), false);
    assert.equal(verifyMasterKey('super_secret_master_test_key_2025'), false);
  } finally {
    if (originalKey !== undefined) {
      process.env.MASTER_ADMIN_KEY = originalKey;
    } else {
      delete process.env.MASTER_ADMIN_KEY;
    }
  }
});

test('Security Guard: checkRateLimit Sliding Window', () => {
  const ip = '192.168.1.100';
  const action = 'test-security-action';

  // 3 attempts max
  const res1 = checkRateLimit(ip, action, 3, 1000);
  assert.equal(res1.allowed, true);

  const res2 = checkRateLimit(ip, action, 3, 1000);
  assert.equal(res2.allowed, true);

  const res3 = checkRateLimit(ip, action, 3, 1000);
  assert.equal(res3.allowed, true);

  // 4th attempt should be blocked
  const res4 = checkRateLimit(ip, action, 3, 1000);
  assert.equal(res4.allowed, false);
  assert.equal(res4.remaining, 0);
});
