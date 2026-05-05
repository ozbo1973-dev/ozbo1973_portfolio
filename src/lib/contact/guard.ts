import { blockedUserAgents } from "@/lib/config";
import { recordSuspiciousIP } from "@/lib/dal/security";
import {
  checkActionRateLimit,
  isBlacklisted,
  trackFailedAttempt,
} from "@/lib/security/rateLimit";

export interface GuardContext {
  ip: string;
  userAgent: string;
  referer: string;
  honeypot?: string;
}

export interface GuardResult {
  ok: boolean;
  reason?: string;
  error?: string;
}

/** Pure in-memory decision — no DB calls. */
export function runSecurityGuard(ctx: GuardContext): GuardResult {
  const { ip, userAgent, referer, honeypot } = ctx;

  if (blockedUserAgents.some((ua) => userAgent.toLowerCase().includes(ua))) {
    return { ok: false, reason: "Suspicious user agent", error: "Suspicious user agent detected. Submission blocked." };
  }

  if (honeypot && honeypot.trim() !== "") {
    return { ok: false, reason: "Honeypot field filled", error: "Bot detected. Submission blocked." };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  // VERCEL_URL is set automatically per-deployment (no protocol prefix)
  const vercelUrl = process.env.VERCEL_URL || "";
  const isAllowedReferer =
    referer.includes("localhost") ||
    (appUrl && referer.includes(appUrl)) ||
    (vercelUrl && referer.includes(vercelUrl));
  if (!referer || !isAllowedReferer) {
    return { ok: false, reason: "Suspicious referer", error: "Suspicious referer. Submission blocked." };
  }

  if (isBlacklisted(ip)) {
    return { ok: false, reason: "Blacklisted IP", error: "Too many failed attempts. Try again later." };
  }

  if (!checkActionRateLimit(ip)) {
    trackFailedAttempt(ip);
    return { ok: false, reason: "Rate limit exceeded", error: "Too many requests. Please wait and try again." };
  }

  return { ok: true };
}

/** Fire-and-forget DB recording. Logs on failure; never throws. */
export async function recordGuardRejection(ip: string, reason: string): Promise<void> {
  try {
    await recordSuspiciousIP(ip, reason);
  } catch (err) {
    console.error("Failed to record guard rejection:", err);
  }
}
