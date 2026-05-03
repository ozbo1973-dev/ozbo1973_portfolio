import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock only the external I/O boundaries and the Next.js headers function.
// Guard, Zod schema validation, and honeypot check run against the real implementation.

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("@/lib/dal", () => ({
  createProspect: vi.fn(),
  updateProspectUserId: vi.fn(),
  recordSuspiciousIP: vi.fn(),
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
}));

vi.mock("@/lib/auth/getUserIdByEmail", () => ({
  getUserIdByEmail: vi.fn(),
}));

import { headers } from "next/headers";
import { createProspect, updateProspectUserId } from "@/lib/dal";
import { sendNotifications } from "@/lib/contact/sendNotifications";
import { auth } from "@/lib/auth/auth";
import { getUserIdByEmail } from "@/lib/auth/getUserIdByEmail";
import { submitContactForm } from "@/app/actions/submitContactForm";
import type { ProspectRecord } from "@/lib/dal";

const mockHeaders = headers as ReturnType<typeof vi.fn>;
const mockCreateProspect = createProspect as ReturnType<typeof vi.fn>;
const mockUpdateProspectUserId = updateProspectUserId as ReturnType<typeof vi.fn>;
const mockSendNotifications = sendNotifications as ReturnType<typeof vi.fn>;
const mockSignInMagicLink = auth.api.signInMagicLink as ReturnType<typeof vi.fn>;
const mockGetUserIdByEmail = getUserIdByEmail as ReturnType<typeof vi.fn>;

function makeHeadersMap(overrides: Record<string, string> = {}) {
  const map: Record<string, string> = {
    "user-agent": "Mozilla/5.0",
    "referer": "http://localhost:3000",
    "x-forwarded-for": "192.0.2.1",
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

const prospect: ProspectRecord = {
  id: "abc123",
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  description: "Help me build something",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("submitContactForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends a magic link to the submitted email on valid submission", async () => {
    mockHeaders.mockResolvedValue(makeHeadersMap({ "x-forwarded-for": "10.1.0.1" }));
    mockCreateProspect.mockResolvedValue(prospect);
    mockSendNotifications.mockResolvedValue(undefined);
    mockSignInMagicLink.mockResolvedValue({ status: true });
    mockGetUserIdByEmail.mockResolvedValue("user-id-123");
    mockUpdateProspectUserId.mockResolvedValue(undefined);

    await submitContactForm(validData);

    expect(mockSignInMagicLink).toHaveBeenCalledOnce();
    expect(mockSignInMagicLink).toHaveBeenCalledWith(
      expect.objectContaining({ body: { email: "jane@example.com" } })
    );
  });

  it("stores the userId from BetterAuth on the ProspectiveCustomer record", async () => {
    mockHeaders.mockResolvedValue(makeHeadersMap({ "x-forwarded-for": "10.1.0.1" }));
    mockCreateProspect.mockResolvedValue(prospect);
    mockSendNotifications.mockResolvedValue(undefined);
    mockSignInMagicLink.mockResolvedValue({ status: true });
    mockGetUserIdByEmail.mockResolvedValue("user-id-123");
    mockUpdateProspectUserId.mockResolvedValue(undefined);

    await submitContactForm(validData);

    expect(mockGetUserIdByEmail).toHaveBeenCalledWith("jane@example.com");
    expect(mockUpdateProspectUserId).toHaveBeenCalledWith("abc123", "user-id-123");
  });

  it("returns { success: true, redirect: '/verify-email' } on valid submission", async () => {
    mockHeaders.mockResolvedValue(makeHeadersMap({ "x-forwarded-for": "10.1.0.1" }));
    mockCreateProspect.mockResolvedValue(prospect);
    mockSendNotifications.mockResolvedValue(undefined);
    mockSignInMagicLink.mockResolvedValue({ status: true });
    mockGetUserIdByEmail.mockResolvedValue("user-id-123");
    mockUpdateProspectUserId.mockResolvedValue(undefined);

    const result = await submitContactForm(validData);

    expect(result).toEqual({ success: true, redirect: "/verify-email" });
  });

  it("returns { success: false } and does not send magic link when magic link send fails", async () => {
    mockHeaders.mockResolvedValue(makeHeadersMap({ "x-forwarded-for": "10.1.0.1" }));
    mockCreateProspect.mockResolvedValue(prospect);
    mockSendNotifications.mockResolvedValue(undefined);
    mockSignInMagicLink.mockRejectedValue(new Error("Resend API error"));
    mockGetUserIdByEmail.mockResolvedValue("user-id-123");
    mockUpdateProspectUserId.mockResolvedValue(undefined);

    const result = await submitContactForm(validData);

    expect(result).toMatchObject({ success: false });
    expect(mockUpdateProspectUserId).not.toHaveBeenCalled();
  });

  it("returns { success: false } without calling createProspect when honeypot is filled", async () => {
    mockHeaders.mockResolvedValue(makeHeadersMap({ "x-forwarded-for": "10.1.0.2" }));

    const result = await submitContactForm({ ...validData, company: "I am a bot" });

    expect(result).toMatchObject({ success: false });
    expect(mockCreateProspect).not.toHaveBeenCalled();
    expect(mockSignInMagicLink).not.toHaveBeenCalled();
  });

  it("returns { success: false } without calling createProspect when a required field is missing", async () => {
    mockHeaders.mockResolvedValue(makeHeadersMap({ "x-forwarded-for": "10.1.0.3" }));

    const result = await submitContactForm({ ...validData, firstName: "" });

    expect(result).toMatchObject({ success: false });
    expect(mockCreateProspect).not.toHaveBeenCalled();
    expect(mockSignInMagicLink).not.toHaveBeenCalled();
  });
});
