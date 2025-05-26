// middleware.ts - Protection for landing page and contact API
import { NextRequest, NextResponse } from "next/server";
import { isRateLimited } from "@/lib/security/rateLimit";
import { maxRequestsData } from "./lib/config";
import { isSuspiciousRequest } from "./lib/security/suspiciousAgent";

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfIP = request.headers.get("cf-connecting-ip"); // Cloudflare

  return forwarded?.split(",")[0]?.trim() || realIP || cfIP || "unknown";
}

export async function middleware(request: NextRequest) {
  const ip = getClientIP(request);
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  // Apply protection to homepage POST requests and contact API
  const isProtectedRoute =
    (pathname === "/" && method === "POST") ||
    pathname.startsWith("/api/contact");

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Rate limiting (more lenient for homepage visits)
  const maxRequests =
    pathname === "/" ? maxRequestsData.landing : maxRequestsData.others;
  if (isRateLimited(ip, maxRequests)) {
    console.log(`Rate limited IP: ${ip}`);
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": "60",
      },
    });
  }

  // Suspicious request detection
  if (isSuspiciousRequest(request)) {
    console.log(`Suspicious request from IP: ${ip}`, {
      userAgent: request.headers.get("user-agent"),
      referer: request.headers.get("referer"),
      pathname,
      method,
    });

    return new NextResponse("Access Denied", { status: 403 });
  }

  // Add security headers
  const response = NextResponse.next();

  // Security headers for all protected routes
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/api/contact/:path*",
  ],
};
