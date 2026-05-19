import { vi, describe, it, expect, beforeEach } from "vitest";

const { mockVerifyAdminSession, mockArchiveSubmission } = vi.hoisted(() => ({
  mockVerifyAdminSession: vi.fn(),
  mockArchiveSubmission: vi.fn(),
}));

vi.mock("@/lib/dal/admin", () => ({
  verifyAdminSession: mockVerifyAdminSession,
  archiveSubmission: mockArchiveSubmission,
}));

import { archiveSubmissionAction } from "../archiveSubmission";

describe("archiveSubmissionAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyAdminSession.mockResolvedValue({ userId: "admin-1", email: "admin@example.com", name: "Admin" });
    mockArchiveSubmission.mockResolvedValue(undefined);
  });

  it("rejects non-admin caller by re-throwing NEXT_REDIRECT", async () => {
    mockVerifyAdminSession.mockImplementation(() => {
      const err = new Error("NEXT_REDIRECT");
      throw err;
    });

    await expect(archiveSubmissionAction("sub-1")).rejects.toThrow("NEXT_REDIRECT");
  });

  it("returns success true when archive succeeds", async () => {
    const result = await archiveSubmissionAction("sub-1");

    expect(mockArchiveSubmission).toHaveBeenCalledWith("sub-1");
    expect(result).toEqual({ success: true });
  });

  it("returns success false with error when DAL throws", async () => {
    mockArchiveSubmission.mockRejectedValue(new Error("DB connection failed"));

    const result = await archiveSubmissionAction("sub-1");

    expect(result).toEqual({ success: false, error: "Failed to archive submission" });
  });
});
