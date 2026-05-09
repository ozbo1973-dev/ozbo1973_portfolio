import { vi, describe, it, expect, beforeEach } from "vitest";

const { mockVerifySession, mockDeleteSubmission } = vi.hoisted(() => ({
  mockVerifySession: vi.fn(),
  mockDeleteSubmission: vi.fn(),
}));

vi.mock("@/lib/dal/prospects", () => ({
  verifySession: mockVerifySession,
}));

vi.mock("@/lib/dal/index", () => ({
  deleteSubmission: mockDeleteSubmission,
}));

import { deleteSubmissionAction } from "../deleteSubmission";

describe("deleteSubmissionAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifySession.mockResolvedValue({ userId: "user-abc", email: "alice@example.com" });
  });

  it("returns success true when submission is deleted", async () => {
    mockDeleteSubmission.mockResolvedValue(true);

    const result = await deleteSubmissionAction("sub-1");

    expect(mockDeleteSubmission).toHaveBeenCalledWith("sub-1", "user-abc");
    expect(result).toEqual({ success: true });
  });

  it("returns success false when submission does not belong to user", async () => {
    mockDeleteSubmission.mockResolvedValue(false);

    const result = await deleteSubmissionAction("sub-other");

    expect(result).toEqual({ success: false, error: "Submission not found" });
  });

  it("redirects when session is invalid", async () => {
    mockVerifySession.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT:/");
    });

    await expect(deleteSubmissionAction("sub-1")).rejects.toThrow("NEXT_REDIRECT:/");
  });
});
