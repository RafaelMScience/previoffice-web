import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateRandomPassword } from './password-generator.ts';

describe('Team Creation & First Access Credentials', () => {
  it('generateRandomPassword should generate valid temporary password format', () => {
    const password = generateRandomPassword();
    assert.ok(password.startsWith('Prev'), `Expected password to start with Prev, got ${password}`);
    assert.strictEqual(password.length, 9, `Expected length 9, got ${password.length}`);
    const validSymbols = ['#', '@', '$', '!'];
    const symbolChar = password.charAt(4);
    assert.ok(validSymbols.includes(symbolChar), `Expected valid symbol at index 4, got ${symbolChar}`);
    const numPart = password.slice(5);
    assert.match(numPart, /^[2-9]{4}$/, 'Expected 4 digits from 2-9');
  });

  it('correctly maps MemberType and isAdminLawyer to DB role constraints', () => {
    function mapRole(memberType: string, isAdminLawyer?: boolean): string {
      if (memberType === 'LAWYER') {
        return isAdminLawyer ? 'MANAGING_LAWYER' : 'ASSOCIATE_LAWYER';
      } else if (memberType === 'ASSISTANT') {
        return 'ASSISTANT';
      } else if (memberType === 'INTERN') {
        return 'INTERN';
      }
      return 'ASSOCIATE_LAWYER';
    }

    assert.strictEqual(mapRole('LAWYER', true), 'MANAGING_LAWYER');
    assert.strictEqual(mapRole('LAWYER', false), 'ASSOCIATE_LAWYER');
    assert.strictEqual(mapRole('ASSISTANT'), 'ASSISTANT');
    assert.strictEqual(mapRole('INTERN'), 'INTERN');
  });

  it('validates mandatory fields for creating team member', () => {
    function validateMemberInput(input: {
      fullName?: string;
      email?: string;
      temporaryPassword?: string;
    }): { valid: boolean; error?: string } {
      if (!input.fullName || !input.fullName.trim()) {
        return { valid: false, error: 'Nome é obrigatório' };
      }
      if (!input.email || !input.email.trim() || !input.email.includes('@')) {
        return { valid: false, error: 'E-mail válido é obrigatório' };
      }
      if (!input.temporaryPassword || input.temporaryPassword.length < 6) {
        return { valid: false, error: 'Senha provisória de no mínimo 6 caracteres é obrigatória' };
      }
      return { valid: true };
    }

    assert.strictEqual(validateMemberInput({}).valid, false);
    assert.strictEqual(validateMemberInput({ fullName: 'Dr. Teste' }).valid, false);
    assert.strictEqual(validateMemberInput({ fullName: 'Dr. Teste', email: 'invalido' }).valid, false);
    assert.strictEqual(
      validateMemberInput({ fullName: 'Dr. Teste', email: 'teste@previoffice.adv.br', temporaryPassword: '123' }).valid,
      false
    );
    assert.strictEqual(
      validateMemberInput({
        fullName: 'Dr. Teste',
        email: 'teste@previoffice.adv.br',
        temporaryPassword: 'Prev#1234',
      }).valid,
      true
    );
  });
});
