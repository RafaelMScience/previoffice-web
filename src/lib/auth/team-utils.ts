import type { MemberType, TeamPermissions } from '@/types/settings';

export type DbRole = 'MANAGING_LAWYER' | 'ASSOCIATE_LAWYER' | 'ASSISTANT' | 'INTERN';

/**
 * Maps frontend MemberType and administrator flag to PostgreSQL role constraints.
 */
export function mapMemberTypeToDbRole(
  memberType: MemberType,
  isAdminLawyer: boolean = false
): DbRole {
  if (isAdminLawyer) {
    return 'MANAGING_LAWYER';
  }
  if (memberType === 'LAWYER') {
    return 'ASSOCIATE_LAWYER';
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
 * Strips dangerous HTML and scripts from plain-text user inputs.
 */
export function sanitizePlainName(value: string): string {
  if (!value) return '';
  return value
    .replace(/<[^>]*>/g, '') // remove HTML tags
    .replace(/[<>"'&]/g, '') // strip markup injection characters
    .trim();
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
  // Security: Prevent Stored XSS via user name input (OWASP A03:2021)
  const dangerousPattern = /<[^>]+>|javascript:|onerror=|onload=|eval\(/i;
  if (dangerousPattern.test(input.fullName)) {
    return { valid: false, error: 'O nome contém caracteres ou scripts não permitidos.' };
  }
  if (!input.email || !input.email.trim() || !input.email.includes('@')) {
    return { valid: false, error: 'E-mail institucional válido é obrigatório.' };
  }
  if (!input.temporaryPassword || input.temporaryPassword.length < 8) {
    return { valid: false, error: 'A senha provisória deve conter no mínimo 8 caracteres.' };
  }
  return { valid: true };
}
