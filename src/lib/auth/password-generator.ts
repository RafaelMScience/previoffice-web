/**
 * Cryptographically secure temporary password generator.
 * Works across both Node.js and browser environments using Web Crypto API.
 */
export function generateRandomPassword(entropyLength: number = 10): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // exclude ambiguous I, O
  const lower = 'abcdefghijkmnopqrstuvwxyz'; // exclude ambiguous l
  const numbers = '23456789'; // exclude ambiguous 0, 1
  const symbols = '!@#$%&*';
  const all = upper + lower + numbers + symbols;

  const getRandomChar = (charset: string): string => {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return charset[buffer[0] % charset.length];
  };

  // Ensure at least one from each character category
  const guaranteed = [
    getRandomChar(upper),
    getRandomChar(lower),
    getRandomChar(numbers),
    getRandomChar(symbols),
  ];

  const remainingCount = Math.max(6, entropyLength) - guaranteed.length;
  const rest: string[] = [];
  for (let i = 0; i < remainingCount; i++) {
    rest.push(getRandomChar(all));
  }

  const combined = [...guaranteed, ...rest];
  // Fisher-Yates shuffle using cryptographically secure random integers
  for (let i = combined.length - 1; i > 0; i--) {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    const j = buffer[0] % (i + 1);
    const temp = combined[i];
    combined[i] = combined[j];
    combined[j] = temp;
  }

  return `Prev#${combined.join('')}`;
}
