export function generateRandomPassword(): string {
  const chars = '23456789';
  const symbols = ['#', '@', '$', '!'];
  const sym = symbols[Math.floor(Math.random() * symbols.length)];
  let numStr = '';
  for (let i = 0; i < 4; i++) {
    numStr += chars[Math.floor(Math.random() * chars.length)];
  }
  return `Prev${sym}${numStr}`;
}
