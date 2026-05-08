import { vi, describe, it, expect, beforeEach } from "vitest";

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

import { getUserIdByEmail } from "@/lib/auth/getUserIdByEmail";
import { auth } from "@/lib/auth/auth";
import { signIn } from "@/lib/auth/actions/signIn";

const mockGetUserIdByEmail = getUserIdByEmail as ReturnType<typeof vi.fn>;
const mockSignInMagicLink = auth.api.signInMagicLink as ReturnType<typeof vi.fn>;

describe("signIn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
