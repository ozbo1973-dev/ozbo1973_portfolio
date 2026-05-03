import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock only the two external I/O boundaries and the Next.js headers function.
// Guard, Zod schema validation, and honeypot check run against the real implementation.

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("@/lib/dal", () => ({
  createProspect: vi.fn(),
  recordSuspiciousIP: vi.fn(),
}));

vi.mock("@/lib/contact/sendNotifications", () => ({
  sendNotifications: vi.fn(),
}));

import { headers } from "next/headers";
import { createProspect } from "@/lib/dal";
import { sendNotifications } from "@/lib/contact/sendNotifications";
import { submitContactForm } from "@/app/actions/submitContactForm";
import type { ProspectRecord } from "@/lib/dal";

const mockHeaders = headers as ReturnType<typeof vi.fn>;
const mockCreateProspect = createProspect as ReturnType<typeof vi.fn>;
const mockSendNotifications = sendNotifications as ReturnType<typeof vi.fn>;

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

describe("submitContactForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns { success: true } for a valid submission with clean inputs", async () => {
    mockHeaders.mockResolvedValue(makeHeadersMap({ "x-forwarded-for": "10.1.0.1" }));
    const prospect: ProspectRecord = {
      id: "abc123",
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      description: "Help me build something",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockCreateProspect.mockResolvedValue(prospect);
    mockSendNotifications.mockResolvedValue(undefined);

    const result = await submitContactForm(validData);

    expect(result).toEqual({ success: true });
    expect(mockCreateProspect).toHaveBeenCalledOnce();
    expect(mockSendNotifications).toHaveBeenCalledOnce();
  });

  it("returns { success: false } without calling createProspect when honeypot is filled", async () => {
    mockHeaders.mockResolvedValue(makeHeadersMap({ "x-forwarded-for": "10.1.0.2" }));

    const result = await submitContactForm({ ...validData, company: "I am a bot" });

    expect(result).toMatchObject({ success: false });
    expect(mockCreateProspect).not.toHaveBeenCalled();
  });

  it("returns { success: false } without calling createProspect when a required field is missing", async () => {
    mockHeaders.mockResolvedValue(makeHeadersMap({ "x-forwarded-for": "10.1.0.3" }));

    const result = await submitContactForm({ ...validData, firstName: "" });

    expect(result).toMatchObject({ success: false });
    expect(mockCreateProspect).not.toHaveBeenCalled();
  });
});
