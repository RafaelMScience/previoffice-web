/**
 * Pure, lightweight, zero-dependency utility functions for Brazilian document and contact masks.
 * Fully compatible with React 19, SSR, and Next.js App Router.
 */

/**
 * Strips all non-digit characters.
 */
export function unmask(value?: string | null): string {
  if (!value) return '';
  return value.replace(/\D/g, '');
}

/**
 * Formats a CPF as 000.000.000-00 (up to 11 digits).
 */
export function maskCpf(value?: string | null): string {
  const digits = unmask(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

/**
 * Formats a CNPJ as 00.000.000/0001-00 (up to 14 digits).
 */
export function maskCnpj(value?: string | null): string {
  const digits = unmask(value).slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

/**
 * Formats dynamically as CPF (up to 11 digits) or CNPJ (12 to 14 digits).
 * Useful for taxId fields that accept either individual or legal entity.
 */
export function maskCpfCnpj(value?: string | null): string {
  const digits = unmask(value).slice(0, 14);
  if (digits.length <= 11) {
    return maskCpf(digits);
  }
  return maskCnpj(digits);
}

/**
 * Formats dynamically for Brazilian phone numbers:
 * - Fixed line / 8 digits + DDD (10 digits): (83) 3321-4567
 * - Mobile / 9 digits + DDD (11 digits): (83) 98888-4567
 */
export function maskPhone(value?: string | null): string {
  const digits = unmask(value).slice(0, 11);
  if (!digits) return '';

  if (digits.length <= 2) {
    return `(${digits}`;
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    // 8-digit phone with DDD: (83) 3321-4567
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  // 9-digit mobile phone with DDD: (83) 98888-4567
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Formats Brazilian postal code (CEP) as 00000-000 (up to 8 digits).
 */
export function maskCep(value?: string | null): string {
  const digits = unmask(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
}

/**
 * Formats INSS Benefit Number (NB) as 000.000.000-0 (up to 10 digits).
 */
export function maskBenefitNumber(value?: string | null): string {
  const digits = unmask(value).slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 10)}`;
}

