import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("@/lib/auth/getUserByEmail", () => ({
  getUserByEmail: vi.fn(),
}));

vi.mock("@/lib/auth/auth", () => ({
  auth: {
    api: {
      signInMagicLink: vi.fn(),
    },
  },
  registerMagicLinkCapture: vi.fn(),
}));

vi.mock("@/lib/contact/sendNotifications", () => ({
  sendMagicLinkEmail: vi.fn(),
}));

import { headers } from "next/headers";
import { getUserByEmail } from "@/lib/auth/getUserByEmail";
import { auth, registerMagicLinkCapture } from "@/lib/auth/auth";
import { sendMagicLinkEmail } from "@/lib/contact/sendNotifications";
import { signIn } from "@/lib/auth/actions/signIn";

const mockHeaders = headers as ReturnType<typeof vi.fn>;
const mockGetUserByEmail = getUserByEmail as ReturnType<typeof vi.fn>;
const mockSignInMagicLink = auth.api.signInMagicLink as ReturnType<typeof vi.fn>;
const mockRegisterMagicLinkCapture = registerMagicLinkCapture as ReturnType<typeof vi.fn>;
const mockSendMagicLinkEmail = sendMagicLinkEmail as ReturnType<typeof vi.fn>;

function makeHeadersMap(overrides: Record<string, string> = {}) {
  const map: Record<string, string> = { ...overrides };
  return { get: (key: string) => map[key.toLowerCase()] ?? null };
}

describe("signIn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHeaders.mockResolvedValue(makeHeadersMap());
    mockRegisterMagicLinkCapture.mockResolvedValue("https://example.com/magic?token=abc");
    mockSendMagicLinkEmail.mockResolvedValue(undefined);
  });

  it("returns { success: true } for a registered email", async () => {
    mockGetUserByEmail.mockResolvedValue({ id: "user-id-123", role: null });
    mockSignInMagicLink.mockResolvedValue({ status: true });

    const result = await signIn("registered@example.com");

    expect(result).toEqual({ success: true });
  });

  it("calls signInMagicLink with the registered email", async () => {
    mockGetUserByEmail.mockResolvedValue({ id: "user-id-123", role: null });
    mockSignInMagicLink.mockResolvedValue({ status: true });

    await signIn("registered@example.com");

    expect(mockSignInMagicLink).toHaveBeenCalledOnce();
    expect(mockSignInMagicLink).toHaveBeenCalledWith(
      expect.objectContaining({ body: expect.objectContaining({ email: "registered@example.com" }) })
    );
  });

  it("returns { success: true } for an unregistered email", async () => {
    mockGetUserByEmail.mockResolvedValue(null);

    const result = await signIn("unknown@example.com");

    expect(result).toEqual({ success: true });
  });

  it("does not call signInMagicLink for an unregistered email", async () => {
    mockGetUserByEmail.mockResolvedValue(null);

    await signIn("unknown@example.com");

    expect(mockSignInMagicLink).not.toHaveBeenCalled();
  });

  it("normalizes a mixed-case email to lowercase before looking up the user", async () => {
    mockGetUserByEmail.mockResolvedValue({ id: "user-id-123", role: null });
    mockSignInMagicLink.mockResolvedValue({ status: true });

    await signIn("User@Example.com");

    expect(mockGetUserByEmail).toHaveBeenCalledWith("user@example.com");
    expect(mockSignInMagicLink).toHaveBeenCalledWith(
      expect.objectContaining({ body: expect.objectContaining({ email: "user@example.com" }) })
    );
  });

  it("uses /admin callbackURL for admin users", async () => {
    mockGetUserByEmail.mockResolvedValue({ id: "admin-id", role: "admin" });
    mockSignInMagicLink.mockResolvedValue({ status: true });

    await signIn("admin@example.com");

    expect(mockSignInMagicLink).toHaveBeenCalledWith(
      expect.objectContaining({ body: expect.objectContaining({ callbackURL: "/admin" }) })
    );
  });

  it("uses /portal callbackURL for non-admin users", async () => {
    mockGetUserByEmail.mockResolvedValue({ id: "user-id", role: null });
    mockSignInMagicLink.mockResolvedValue({ status: true });

    await signIn("user@example.com");

    expect(mockSignInMagicLink).toHaveBeenCalledWith(
      expect.objectContaining({ body: expect.objectContaining({ callbackURL: "/portal" }) })
    );
  });
});
