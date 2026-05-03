import { runSecurityGuard } from "@/lib/contact/guard";
import { trackFailedAttempt } from "@/lib/security/rateLimit";

describe("runSecurityGuard", () => {
  it("blocks a request with a suspicious user agent", () => {
    const result = runSecurityGuard({
      ip: "10.0.0.1",
      userAgent: "curl/7.64.1",
      referer: "http://localhost:3000",
    });
    expect(result).toMatchObject({ ok: false, reason: "Suspicious user agent" });
  });

  it("blocks a request with a filled honeypot", () => {
    const result = runSecurityGuard({
      ip: "10.0.0.2",
      userAgent: "Mozilla/5.0",
      referer: "http://localhost:3000",
      honeypot: "i am a bot",
    });
    expect(result).toMatchObject({ ok: false, reason: "Honeypot field filled" });
  });

  it("blocks a request with a missing referer", () => {
    const result = runSecurityGuard({
      ip: "10.0.0.3",
      userAgent: "Mozilla/5.0",
      referer: "",
    });
    expect(result).toMatchObject({ ok: false, reason: "Suspicious referer" });
  });

  it("blocks a request with an invalid referer", () => {
    const result = runSecurityGuard({
      ip: "10.0.0.4",
      userAgent: "Mozilla/5.0",
      referer: "https://evil.example.com",
    });
    expect(result).toMatchObject({ ok: false, reason: "Suspicious referer" });
  });

  it("blocks a blacklisted IP", () => {
    const ip = "10.0.0.5";
    for (let i = 0; i < 10; i++) {
      trackFailedAttempt(ip);
    }
    const result = runSecurityGuard({
      ip,
      userAgent: "Mozilla/5.0",
      referer: "http://localhost:3000",
    });
    expect(result).toMatchObject({ ok: false, reason: "Blacklisted IP" });
  });

  it("blocks a rate-limited IP on the 4th request", () => {
    const ip = "10.0.0.6";
    for (let i = 0; i < 3; i++) {
      runSecurityGuard({ ip, userAgent: "Mozilla/5.0", referer: "http://localhost:3000" });
    }
    const result = runSecurityGuard({
      ip,
      userAgent: "Mozilla/5.0",
      referer: "http://localhost:3000",
    });
    expect(result).toMatchObject({ ok: false, reason: "Rate limit exceeded" });
  });

  it("allows a clean request", () => {
    const result = runSecurityGuard({
      ip: "10.0.0.7",
      userAgent: "Mozilla/5.0",
      referer: "http://localhost:3000",
    });
    expect(result).toEqual({ ok: true });
  });
});
