import { blockedUserAgents } from "@/lib/config";
import { recordSuspiciousIP } from "@/lib/dal";
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
  error?: string;
}

export async function runSecurityGuard(ctx: GuardContext): Promise<GuardResult> {
  const { ip, userAgent, referer, honeypot } = ctx;

  if (blockedUserAgents.some((ua) => userAgent.toLowerCase().includes(ua))) {
    await recordSuspiciousIP(ip, "Suspicious user agent");
    return { ok: false, error: "Suspicious user agent detected. Submission blocked." };
  }

  if (honeypot && honeypot.trim() !== "") {
    await recordSuspiciousIP(ip, "Honeypot field filled");
    return { ok: false, error: "Bot detected. Submission blocked." };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  if (!referer || (!referer.includes(appUrl) && !referer.includes("localhost"))) {
    await recordSuspiciousIP(ip, "Suspicious referer");
    return { ok: false, error: "Suspicious referer. Submission blocked." };
  }

  if (isBlacklisted(ip)) {
    await recordSuspiciousIP(ip, "Blacklisted IP");
    return { ok: false, error: "Too many failed attempts. Try again later." };
  }

  if (!checkActionRateLimit(ip)) {
    await recordSuspiciousIP(ip, "Rate limit exceeded");
    trackFailedAttempt(ip);
    return { ok: false, error: "Too many requests. Please wait and try again." };
  }

  return { ok: true };
}
