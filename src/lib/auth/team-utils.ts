import type { MemberType, TeamPermissions } from '@/types/settings';

export type DbRole = 'MANAGING_LAWYER' | 'ASSOCIATE_LAWYER' | 'ASSISTANT' | 'INTERN';

/**
 * Maps frontend MemberType and administrator flag to PostgreSQL role constraints.
 */
export function mapMemberTypeToDbRole(
  memberType: MemberType,
  isAdminLawyer: boolean = false
): DbRole {
  if (memberType === 'LAWYER') {
    return isAdminLawyer ? 'MANAGING_LAWYER' : 'ASSOCIATE_LAWYER';
  }
  if (memberType === 'ASSISTANT') {
    return 'ASSISTANT';
  }
  if (memberType === 'INTERN') {
    return 'INTERN';
  }
  return 'ASSOCIATE_LAWYER';
}

/**
 * Validates team member input payload.
 */
export function validateTeamMemberInput(input: {
  fullName?: string;
  email?: string;
  temporaryPassword?: string;
}): { valid: boolean; error?: string } {
  if (!input.fullName || !input.fullName.trim()) {
    return { valid: false, error: 'Nome completo é obrigatório.' };
  }
  if (!input.email || !input.email.trim() || !input.email.includes('@')) {
    return { valid: false, error: 'E-mail institucional válido é obrigatório.' };
  }
  if (!input.temporaryPassword || input.temporaryPassword.length < 8) {
    return { valid: false, error: 'A senha provisória deve conter no mínimo 8 caracteres.' };
  }
  return { valid: true };
}
