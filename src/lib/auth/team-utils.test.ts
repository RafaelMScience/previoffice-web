import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  mapMemberTypeToDbRole,
  validateTeamMemberInput,
  sanitizePlainName,
} from './team-utils.ts';

describe('Security & Team Utilities: team-utils', () => {
  describe('sanitizePlainName', () => {
    it('should strip HTML tags and special markup characters', () => {
      const malicious = '<script>alert("XSS")</script>Dr. Carlos Silva';
      assert.strictEqual(sanitizePlainName(malicious), 'alert(XSS)Dr. Carlos Silva');
    });

    it('should return empty string for null, undefined, or empty', () => {
      assert.strictEqual(sanitizePlainName(''), '');
      assert.strictEqual(sanitizePlainName(null as any), '');
      assert.strictEqual(sanitizePlainName(undefined as any), '');
    });

    it('should keep safe plain text intact', () => {
      assert.strictEqual(sanitizePlainName('Dra. Ana Beatriz Pereira'), 'Dra. Ana Beatriz Pereira');
    });
  });

  describe('validateTeamMemberInput (XSS & Injection Protection)', () => {
    it('should accept valid team member data', () => {
      const res = validateTeamMemberInput({
        fullName: 'Dr. Roberto Santos',
        email: 'roberto@escritorio.adv.br',
        temporaryPassword: 'Prev#TestPass2026',
      });
      assert.strictEqual(res.valid, true);
    });

    it('should reject script tags in full name (Stored XSS prevention)', () => {
      const res = validateTeamMemberInput({
        fullName: '<script>alert(1)</script>',
        email: 'attacker@escritorio.adv.br',
        temporaryPassword: 'Prev#TestPass2026',
      });
      assert.strictEqual(res.valid, false);
      assert.match(res.error || '', /scripts não permitidos/i);
    });

    it('should reject HTML img tags with onerror handlers', () => {
      const res = validateTeamMemberInput({
        fullName: '<img src=x onerror=alert(document.cookie)>',
        email: 'attacker@escritorio.adv.br',
        temporaryPassword: 'Prev#TestPass2026',
      });
      assert.strictEqual(res.valid, false);
      assert.match(res.error || '', /scripts não permitidos/i);
    });

    it('should reject javascript: pseudo-protocol in name', () => {
      const res = validateTeamMemberInput({
        fullName: 'javascript:alert(1)',
        email: 'attacker@escritorio.adv.br',
        temporaryPassword: 'Prev#TestPass2026',
      });
      assert.strictEqual(res.valid, false);
      assert.match(res.error || '', /scripts não permitidos/i);
    });

    it('should reject empty or missing fields', () => {
      assert.strictEqual(validateTeamMemberInput({}).valid, false);
      assert.strictEqual(
        validateTeamMemberInput({ fullName: 'Dr. Roberto', email: 'invalid-email', temporaryPassword: 'short' })
          .valid,
        false
      );
    });
  });

  describe('mapMemberTypeToDbRole (Privilege Escalation Protection)', () => {
    it('should map MANAGING_LAWYER only when isAdminLawyer is true', () => {
      assert.strictEqual(mapMemberTypeToDbRole('LAWYER', true), 'MANAGING_LAWYER');
      assert.strictEqual(mapMemberTypeToDbRole('LAWYER', false), 'ASSOCIATE_LAWYER');
      assert.strictEqual(mapMemberTypeToDbRole('ASSISTANT', false), 'ASSISTANT');
      assert.strictEqual(mapMemberTypeToDbRole('INTERN', false), 'INTERN');
    });
  });
});
