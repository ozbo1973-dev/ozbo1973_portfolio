import { blockedUserAgents } from "@/lib/config";
import { NextRequest } from "next/server";

export function isSuspiciousUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return true;

  const ua = userAgent.toLowerCase();
  return blockedUserAgents.some((blocked) => ua.includes(blocked));
}

export function isSuspiciousRequest(request: NextRequest): boolean {
  const userAgent = request.headers.get("user-agent");
  const accept = request.headers.get("accept");

  // Check for missing common browser headers
  if (!userAgent || !accept) return true;

  // Check for suspicious user agents
  if (isSuspiciousUserAgent(userAgent)) return true;

  // For POST requests to the homepage, check if it's a form submission
  if (request.method === "POST" && request.nextUrl.pathname === "/") {
    const referer = request.headers.get("referer");
    // Should have referer from same domain for form submissions
    if (!referer?.includes(request.nextUrl.origin)) {
      return true;
    }
  }

  // Check for unusual accept headers (browsers typically send text/html)
  if (
    !accept.includes("text/html") &&
    !accept.includes("*/*") &&
    !accept.includes("application/json") &&
    !accept.includes("text/x-component")
  ) {
    return true;
  }

  return false;
}
