import { vi, describe, it, expect, beforeEach } from "vitest";

const { mockDeleteSubmission } = vi.hoisted(() => ({
  mockDeleteSubmission: vi.fn(),
}));

vi.mock("@/lib/dal/prospects", () => ({
  deleteSubmission: mockDeleteSubmission,
}));

import { deleteSubmissionAction } from "../deleteSubmission";

describe("deleteSubmissionAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns success true when submission is deleted", async () => {
    mockDeleteSubmission.mockResolvedValue({ deleted: true });

    const result = await deleteSubmissionAction("sub-1");

    expect(result).toEqual({ success: true });
  });

  it("passes only the domain id to the DAL — does not pass userId", async () => {
    mockDeleteSubmission.mockResolvedValue({ deleted: true });

    await deleteSubmissionAction("sub-1");

    expect(mockDeleteSubmission).toHaveBeenCalledWith("sub-1");
    expect(mockDeleteSubmission).toHaveBeenCalledTimes(1);
  });

  it("returns success false when submission does not belong to user", async () => {
    mockDeleteSubmission.mockResolvedValue({ deleted: false });

    const result = await deleteSubmissionAction("sub-other");

    expect(result).toEqual({ success: false, error: "Submission not found" });
  });

  it("returns success false with blocked flag when admin replies exist", async () => {
    mockDeleteSubmission.mockResolvedValue({ deleted: false, blocked: true });

    const result = await deleteSubmissionAction("sub-1");

    expect(result).toEqual({ success: false, blocked: true, error: expect.any(String) });
  });
});
