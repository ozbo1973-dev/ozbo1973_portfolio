import { vi, describe, it, expect, beforeEach } from "vitest";

const { mockVerifyAdminSession, mockAdminDeleteSubmission } = vi.hoisted(() => ({
  mockVerifyAdminSession: vi.fn(),
  mockAdminDeleteSubmission: vi.fn(),
}));

vi.mock("@/lib/dal/admin", () => ({
  verifyAdminSession: mockVerifyAdminSession,
  adminDeleteSubmission: mockAdminDeleteSubmission,
}));

import { adminDeleteSubmissionAction } from "../deleteSubmission";

describe("adminDeleteSubmissionAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyAdminSession.mockResolvedValue({ userId: "admin-1", email: "admin@example.com", name: "Admin" });
    mockAdminDeleteSubmission.mockResolvedValue(undefined);
  });

  it("rejects non-admin caller by re-throwing NEXT_REDIRECT", async () => {
    mockVerifyAdminSession.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });

    await expect(adminDeleteSubmissionAction("sub-1")).rejects.toThrow("NEXT_REDIRECT");
  });

  it("returns success true when delete succeeds", async () => {
    const result = await adminDeleteSubmissionAction("sub-1");

    expect(mockAdminDeleteSubmission).toHaveBeenCalledWith("sub-1");
    expect(result).toEqual({ success: true });
  });

  it("returns success false with error when DAL throws", async () => {
    mockAdminDeleteSubmission.mockRejectedValue(new Error("DB error"));

    const result = await adminDeleteSubmissionAction("sub-1");

    expect(result).toEqual({ success: false, error: "Failed to delete submission" });
  });
});
