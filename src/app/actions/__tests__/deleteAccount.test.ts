import { vi, describe, it, expect, beforeEach } from "vitest";

const { mockVerifySession, mockDeleteUser } = vi.hoisted(() => ({
  mockVerifySession: vi.fn(),
  mockDeleteUser: vi.fn(),
}));

vi.mock("@/lib/dal/session", () => ({
  verifySession: mockVerifySession,
}));

vi.mock("@/lib/dal/users", () => ({
  deleteUser: mockDeleteUser,
}));

import { deleteAccountAction } from "@/app/actions/deleteAccount";

describe("deleteAccountAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifySession.mockResolvedValue({ userId: "user-abc", email: "alice@example.com" });
    mockDeleteUser.mockResolvedValue(undefined);
  });

  it("verifies the session before doing anything", async () => {
    await deleteAccountAction();
    expect(mockVerifySession).toHaveBeenCalledTimes(1);
  });

  it("calls deleteUser with the session userId", async () => {
    await deleteAccountAction();
    expect(mockDeleteUser).toHaveBeenCalledWith("user-abc");
  });

  it("returns success: true on successful deletion", async () => {
    const result = await deleteAccountAction();
    expect(result).toEqual({ success: true });
  });

  it("returns success: false with error message when verifySession throws", async () => {
    mockVerifySession.mockRejectedValue(new Error("Not authenticated"));
    const result = await deleteAccountAction();
    expect(result).toEqual({ success: false, error: "Not authenticated" });
  });

  it("returns success: false with error message when deleteUser throws", async () => {
    mockDeleteUser.mockRejectedValue(new Error("DB error"));
    const result = await deleteAccountAction();
    expect(result).toEqual({ success: false, error: "DB error" });
  });
});
