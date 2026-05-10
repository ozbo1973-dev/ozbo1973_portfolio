import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("@/lib/auth/getUserIdByEmail", () => ({
  getUserIdByEmail: vi.fn(),
}));

vi.mock("@/lib/auth/auth", () => ({
  auth: {
    api: {
      signInMagicLink: vi.fn(),
    },
  },
}));

import { headers } from "next/headers";
import { getUserIdByEmail } from "@/lib/auth/getUserIdByEmail";
import { auth } from "@/lib/auth/auth";
import { signIn } from "@/lib/auth/actions/signIn";

const mockHeaders = headers as ReturnType<typeof vi.fn>;
const mockGetUserIdByEmail = getUserIdByEmail as ReturnType<typeof vi.fn>;
const mockSignInMagicLink = auth.api.signInMagicLink as ReturnType<typeof vi.fn>;

function makeHeadersMap(overrides: Record<string, string> = {}) {
  const map: Record<string, string> = { ...overrides };
  return { get: (key: string) => map[key.toLowerCase()] ?? null };
}

describe("signIn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHeaders.mockResolvedValue(makeHeadersMap());
  });

  it("returns { success: true } for a registered email", async () => {
    mockGetUserIdByEmail.mockResolvedValue("user-id-123");
    mockSignInMagicLink.mockResolvedValue({ status: true });

    const result = await signIn("registered@example.com");

    expect(result).toEqual({ success: true });
  });

  it("calls signInMagicLink with the registered email", async () => {
    mockGetUserIdByEmail.mockResolvedValue("user-id-123");
    mockSignInMagicLink.mockResolvedValue({ status: true });

    await signIn("registered@example.com");

    expect(mockSignInMagicLink).toHaveBeenCalledOnce();
    expect(mockSignInMagicLink).toHaveBeenCalledWith(
      expect.objectContaining({ body: { email: "registered@example.com" } })
    );
  });

  it("returns { success: true } for an unregistered email", async () => {
    mockGetUserIdByEmail.mockResolvedValue(null);

    const result = await signIn("unknown@example.com");

    expect(result).toEqual({ success: true });
  });

  it("does not call signInMagicLink for an unregistered email", async () => {
    mockGetUserIdByEmail.mockResolvedValue(null);

    await signIn("unknown@example.com");

    expect(mockSignInMagicLink).not.toHaveBeenCalled();
  });

  it("normalizes a mixed-case email to lowercase before looking up the user", async () => {
    mockGetUserIdByEmail.mockResolvedValue("user-id-123");
    mockSignInMagicLink.mockResolvedValue({ status: true });

    await signIn("User@Example.com");

    expect(mockGetUserIdByEmail).toHaveBeenCalledWith("user@example.com");
    expect(mockSignInMagicLink).toHaveBeenCalledWith(
      expect.objectContaining({ body: expect.objectContaining({ email: "user@example.com" }) })
    );
  });
});
