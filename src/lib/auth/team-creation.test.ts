import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateRandomPassword } from './password-generator.ts';
import { mapMemberTypeToDbRole, validateTeamMemberInput } from './team-utils.ts';

describe('Team Creation & First Access Credentials', () => {
  it('generateRandomPassword should generate high-entropy secure temporary password', () => {
    const password = generateRandomPassword();
    assert.ok(password.startsWith('Prev#'), `Expected password to start with Prev#, got ${password}`);
    assert.ok(password.length >= 12, `Expected length >= 12, got ${password.length}`);

    const randomPortion = password.substring(5);
    // Must contain uppercase, lowercase, number, and special character
    assert.match(randomPortion, /[A-Z]/, 'Must contain at least one uppercase letter');
    assert.match(randomPortion, /[a-z]/, 'Must contain at least one lowercase letter');
    assert.match(randomPortion, /[0-9]/, 'Must contain at least one digit');
    assert.match(randomPortion, /[!@#$%&*]/, 'Must contain at least one special symbol');
  });

  it('correctly maps MemberType and isAdminLawyer to DB role constraints using team-utils', () => {
    assert.strictEqual(mapMemberTypeToDbRole('LAWYER', true), 'MANAGING_LAWYER');
    assert.strictEqual(mapMemberTypeToDbRole('LAWYER', false), 'ASSOCIATE_LAWYER');
    assert.strictEqual(mapMemberTypeToDbRole('ASSISTANT', false), 'ASSISTANT');
    assert.strictEqual(mapMemberTypeToDbRole('INTERN', false), 'INTERN');
  });

  it('validates mandatory fields for creating team member using team-utils', () => {
    assert.strictEqual(validateTeamMemberInput({}).valid, false);
    assert.strictEqual(validateTeamMemberInput({ fullName: 'Dr. Teste' }).valid, false);
    assert.strictEqual(validateTeamMemberInput({ fullName: 'Dr. Teste', email: 'invalido' }).valid, false);
    assert.strictEqual(
      validateTeamMemberInput({
        fullName: 'Dr. Teste',
        email: 'teste@previoffice.adv.br',
        temporaryPassword: '123',
      }).valid,
      false
    );
    assert.strictEqual(
      validateTeamMemberInput({
        fullName: 'Dr. Teste',
        email: 'teste@previoffice.adv.br',
        temporaryPassword: 'Prev#Forte@2026',
      }).valid,
      true
    );
  });
});
