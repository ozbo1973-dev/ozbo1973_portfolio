import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock only the external I/O boundaries and the Next.js headers function.
// Guard, Zod schema validation, and honeypot check run against the real implementation.

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("@/lib/dal/prospects", () => ({
  createProspect: vi.fn(),
}));

vi.mock("@/lib/contact/sendNotifications", () => ({
  sendNotifications: vi.fn(),
}));

vi.mock("@/lib/auth/auth", () => ({
  auth: {
    api: {
      signInMagicLink: vi.fn(),
    },
  },
  registerMagicLinkCapture: vi.fn(),
}));

vi.mock("@/lib/auth/getUserIdByEmail", () => ({
  getUserByEmail: vi.fn(),
}));

import { headers } from "next/headers";
import { createProspect } from "@/lib/dal/prospects";
import { sendNotifications } from "@/lib/contact/sendNotifications";
import { auth, registerMagicLinkCapture } from "@/lib/auth/auth";
import { getUserByEmail } from "@/lib/auth/getUserIdByEmail";
import { submitContactForm } from "@/app/actions/submitContactForm";

const mockHeaders = headers as ReturnType<typeof vi.fn>;
const mockCreateProspect = createProspect as ReturnType<typeof vi.fn>;
const mockSendNotifications = sendNotifications as ReturnType<typeof vi.fn>;
const mockSignInMagicLink = auth.api.signInMagicLink as ReturnType<typeof vi.fn>;
const mockGetUserByEmail = getUserByEmail as ReturnType<typeof vi.fn>;
const mockRegisterMagicLinkCapture = registerMagicLinkCapture as ReturnType<typeof vi.fn>;

// Each test gets a unique IP to avoid in-memory rate-limit state bleed between tests.
let ipCounter = 10;
function nextIp() {
  return `10.2.0.${ipCounter++}`;
}

function makeHeadersMap(overrides: Record<string, string> = {}) {
  const map: Record<string, string> = {
    "user-agent": "Mozilla/5.0",
    "referer": "http://localhost:3000",
    "x-forwarded-for": nextIp(),
    ...overrides,
  };
  return { get: (key: string) => map[key.toLowerCase()] ?? null };
}

const validData = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  description: "Help me build something",
  company: "",
};

const prospect = {
  id: "abc123",
  userId: "user-id-123",
  description: "Help me build something",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const MAGIC_LINK_URL = "https://example.com/magic?token=abc";

describe("submitContactForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends a magic link to the submitted email on valid submission", async () => {
    mockHeaders.mockResolvedValue(makeHeadersMap());
    mockRegisterMagicLinkCapture.mockResolvedValue(MAGIC_LINK_URL);
    mockSignInMagicLink.mockResolvedValue({ status: true });
    mockGetUserByEmail.mockResolvedValue({ id: "user-id-123", emailVerified: false });
    mockCreateProspect.mockResolvedValue(prospect);
    mockSendNotifications.mockResolvedValue(undefined);

    await submitContactForm(validData);

    expect(mockSignInMagicLink).toHaveBeenCalledOnce();
    expect(mockSignInMagicLink).toHaveBeenCalledWith(
      expect.objectContaining({ body: expect.objectContaining({ email: "jane@example.com" }) })
    );
  });

  it("includes the magic link URL in the customer confirmation email", async () => {
    mockHeaders.mockResolvedValue(makeHeadersMap());
    mockRegisterMagicLinkCapture.mockResolvedValue(MAGIC_LINK_URL);
    mockSignInMagicLink.mockResolvedValue({ status: true });
    mockGetUserByEmail.mockResolvedValue({ id: "user-id-123", emailVerified: false });
    mockCreateProspect.mockResolvedValue(prospect);
    mockSendNotifications.mockResolvedValue(undefined);

    await submitContactForm(validData);

    expect(mockSendNotifications).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: "Jane", lastName: "Doe", email: "jane@example.com" }),
      MAGIC_LINK_URL
    );
  });

  it("creates the prospect with userId after magic link resolves", async () => {
    mockHeaders.mockResolvedValue(makeHeadersMap());
    mockRegisterMagicLinkCapture.mockResolvedValue(MAGIC_LINK_URL);
    mockSignInMagicLink.mockResolvedValue({ status: true });
    mockGetUserByEmail.mockResolvedValue({ id: "user-id-123", emailVerified: false });
    mockCreateProspect.mockResolvedValue(prospect);
    mockSendNotifications.mockResolvedValue(undefined);

    await submitContactForm(validData);

    expect(mockGetUserByEmail).toHaveBeenCalledWith("jane@example.com");
    expect(mockCreateProspect).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-id-123", description: "Help me build something" })
    );
  });

  it("returns { success: true, redirect: '/verify-email' } on valid submission", async () => {
    mockHeaders.mockResolvedValue(makeHeadersMap());
    mockRegisterMagicLinkCapture.mockResolvedValue(MAGIC_LINK_URL);
    mockSignInMagicLink.mockResolvedValue({ status: true });
    mockGetUserByEmail.mockResolvedValue({ id: "user-id-123", emailVerified: false });
    mockCreateProspect.mockResolvedValue(prospect);
    mockSendNotifications.mockResolvedValue(undefined);

    const result = await submitContactForm(validData);

    expect(result).toEqual({ success: true, redirect: "/verify-email" });
  });

  it("returns { success: false } and does not create prospect when magic link send fails", async () => {
    mockHeaders.mockResolvedValue(makeHeadersMap());
    mockRegisterMagicLinkCapture.mockResolvedValue(MAGIC_LINK_URL);
    mockSignInMagicLink.mockRejectedValue(new Error("Resend API error"));
    mockSendNotifications.mockResolvedValue(undefined);
    mockGetUserByEmail.mockResolvedValue({ id: "user-id-123", emailVerified: false });

    const result = await submitContactForm(validData);

    expect(result).toMatchObject({ success: false });
    expect(mockCreateProspect).not.toHaveBeenCalled();
  });

  it("redirects verified existing users to /sign-in?sent=true instead of /verify-email", async () => {
    mockHeaders.mockResolvedValue(makeHeadersMap({ "x-forwarded-for": "10.1.0.10" }));
    mockRegisterMagicLinkCapture.mockResolvedValue(MAGIC_LINK_URL);
    mockSignInMagicLink.mockResolvedValue({ status: true });
    mockGetUserByEmail.mockResolvedValue({ id: "user-id-123", emailVerified: true });
    mockCreateProspect.mockResolvedValue(prospect);
    mockSendNotifications.mockResolvedValue(undefined);

    const result = await submitContactForm(validData);

    expect(result).toEqual({ success: true, redirect: "/sign-in?sent=true" });
  });

  it("redirects unverified existing users to /verify-email", async () => {
    mockHeaders.mockResolvedValue(makeHeadersMap({ "x-forwarded-for": "10.1.0.11" }));
    mockRegisterMagicLinkCapture.mockResolvedValue(MAGIC_LINK_URL);
    mockSignInMagicLink.mockResolvedValue({ status: true });
    mockGetUserByEmail.mockResolvedValue({ id: "user-id-123", emailVerified: false });
    mockCreateProspect.mockResolvedValue(prospect);
    mockSendNotifications.mockResolvedValue(undefined);

    const result = await submitContactForm(validData);

    expect(result).toEqual({ success: true, redirect: "/verify-email" });
  });

  it("returns { success: false } without calling createProspect when honeypot is filled", async () => {
    mockHeaders.mockResolvedValue(makeHeadersMap());

    const result = await submitContactForm({ ...validData, company: "I am a bot" });

    expect(result).toMatchObject({ success: false });
    expect(mockCreateProspect).not.toHaveBeenCalled();
    expect(mockSignInMagicLink).not.toHaveBeenCalled();
  });

  it("returns { success: false } without calling createProspect when a required field is missing", async () => {
    mockHeaders.mockResolvedValue(makeHeadersMap());

    const result = await submitContactForm({ ...validData, firstName: "" });

    expect(result).toMatchObject({ success: false });
    expect(mockCreateProspect).not.toHaveBeenCalled();
    expect(mockSignInMagicLink).not.toHaveBeenCalled();
  });

  it("normalizes a mixed-case email to lowercase before creating prospect and sending magic link", async () => {
    mockHeaders.mockResolvedValue(makeHeadersMap());
    mockRegisterMagicLinkCapture.mockResolvedValue(MAGIC_LINK_URL);
    mockSignInMagicLink.mockResolvedValue({ status: true });
    mockGetUserByEmail.mockResolvedValue({ id: "user-id-123", emailVerified: false });
    mockCreateProspect.mockResolvedValue({ ...prospect, email: "user@example.com" });
    mockSendNotifications.mockResolvedValue(undefined);

    await submitContactForm({ ...validData, email: "User@Example.com" });

    expect(mockSignInMagicLink).toHaveBeenCalledWith(
      expect.objectContaining({ body: expect.objectContaining({ email: "user@example.com" }) })
    );
  });
});
