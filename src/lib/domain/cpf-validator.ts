/**
 * Pure CPF (Cadastro de Pessoas Físicas) validation algorithm
 * Verifies official check digits according to Brazilian Federal Revenue rules.
 */

export function normalizeCpf(rawCpf?: string | null): string {
  if (!rawCpf) return '';
  return rawCpf.replace(/\D/g, '');
}

export function formatCpf(rawCpf?: string | null): string {
  const digits = normalizeCpf(rawCpf);
  if (digits.length !== 11) return rawCpf || '';
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export function isValidCpf(rawCpf?: string | null): boolean {
  const digits = normalizeCpf(rawCpf);
  if (digits.length !== 11) return false;

  // Disallow repetitive patterns like 111.111.111-11
  if (/^(\d)\1{10}$/.test(digits)) return false;

  // First check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i], 10) * (10 - i);
  }
  let firstRemainder = (sum * 10) % 11;
  if (firstRemainder === 10 || firstRemainder === 11) firstRemainder = 0;
  if (firstRemainder !== parseInt(digits[9], 10)) return false;

  // Second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i], 10) * (11 - i);
  }
  let secondRemainder = (sum * 10) % 11;
  if (secondRemainder === 10 || secondRemainder === 11) secondRemainder = 0;
  if (secondRemainder !== parseInt(digits[10], 10)) return false;

  return true;
}
