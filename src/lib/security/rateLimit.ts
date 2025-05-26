// In-memory rate limiting (replace with Redis for production)
const actionRateLimitStore = new Map<
  string,
  { count: number; resetTime: number }
>();
const failedAttempts = new Map<string, number>();

export function checkActionRateLimit(
  ip: string,
  maxRequests = 3,
  windowMs = 5 * 60 * 1000
): boolean {
  const now = Date.now();
  const record = actionRateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    actionRateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

export function trackFailedAttempt(ip: string): number {
  const attempts = failedAttempts.get(ip) || 0;
  const newAttempts = attempts + 1;
  failedAttempts.set(ip, newAttempts);

  // Clean up old entries periodically
  if (newAttempts % 10 === 0) {
    setTimeout(() => failedAttempts.delete(ip), 30 * 60 * 1000); // 30 min cleanup
  }

  return newAttempts;
}

export function isBlacklisted(ip: string): boolean {
  const attempts = failedAttempts.get(ip) || 0;
  return attempts >= 10; // Block after 10 failed attempts
}

// For middleware (less strict, customizable)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
export function isRateLimited(
  ip: string,
  maxRequests = 15,
  windowMs = 60 * 1000
): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (record.count >= maxRequests) {
    return true;
  }

  record.count++;
  return false;
}
