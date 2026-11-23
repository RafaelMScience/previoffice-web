import crypto from 'crypto';

// In-memory sliding window cache for rate limiting (resets per instance / pod)
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * Checks sliding-window rate limit for a client IP and action.
 * Returns { allowed: boolean, remaining: number }
 */
export function checkRateLimit(
  ip: string,
  action: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number } {
  const key = `${action}:${ip}`;
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (record.count >= maxAttempts) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  rateLimitMap.set(key, record);
  return { allowed: true, remaining: maxAttempts - record.count };
}

/**
 * Validates the provided master administrative key against the environment secret.
 * Uses crypto.timingSafeEqual to prevent side-channel timing attacks.
 */
export function verifyMasterKey(providedKey: string): boolean {
  if (!providedKey || typeof providedKey !== 'string') {
    return false;
  }

  const configuredMasterKey = process.env.MASTER_ADMIN_KEY;
  if (!configuredMasterKey) {
    console.error('SECURITY ALERT: MASTER_ADMIN_KEY is not defined in environment variables. Refusing master authentication.');
    return false;
  }

  // Normalize lengths to avoid timing leakage via length mismatch
  const providedBuffer = Buffer.from(providedKey);
  const secretBuffer = Buffer.from(configuredMasterKey);

  if (providedBuffer.length !== secretBuffer.length) {
    // Perform dummy timing safe compare to consume equal CPU cycles
    crypto.timingSafeEqual(secretBuffer, secretBuffer);
    return false;
  }

  return crypto.timingSafeEqual(providedBuffer, secretBuffer);
}
