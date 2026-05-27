import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/lib/db/connect", () => ({ default: vi.fn() }));

const { mockFindByIdAndUpdate, mockDeleteMany } = vi.hoisted(() => ({
  mockFindByIdAndUpdate: vi.fn(),
  mockDeleteMany: vi.fn(),
}));

vi.mock("@/lib/models/ProspectiveCustomer", () => ({
  default: {
    findByIdAndUpdate: mockFindByIdAndUpdate,
    deleteMany: mockDeleteMany,
  },
}));

import { updateProspectUserId, deleteAllSubmissionsByUser } from "@/lib/dal/prospects-unverified";

describe("updateProspectUserId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls findByIdAndUpdate with the given id and userId", async () => {
    mockFindByIdAndUpdate.mockResolvedValue({});

    await updateProspectUserId("prospect-1", "user-abc");

    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith("prospect-1", { userId: "user-abc" });
  });

  it("does not call deleteMany or any other write", async () => {
    mockFindByIdAndUpdate.mockResolvedValue({});

    await updateProspectUserId("prospect-1", "user-abc");

    expect(mockDeleteMany).not.toHaveBeenCalled();
  });
});

describe("deleteAllSubmissionsByUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls deleteMany scoped to the given userId and returns the count", async () => {
    mockDeleteMany.mockResolvedValue({ deletedCount: 4 });

    const count = await deleteAllSubmissionsByUser("user-abc");

    expect(mockDeleteMany).toHaveBeenCalledWith({ userId: "user-abc" });
    expect(count).toBe(4);
  });

  it("returns 0 when the user has no submissions", async () => {
    mockDeleteMany.mockResolvedValue({ deletedCount: 0 });

    const count = await deleteAllSubmissionsByUser("user-none");

    expect(count).toBe(0);
  });

  it("scopes the delete query to userId only", async () => {
    mockDeleteMany.mockResolvedValue({ deletedCount: 1 });

    await deleteAllSubmissionsByUser("user-abc");

    const callArg = mockDeleteMany.mock.calls[0][0];
    expect(callArg).toEqual({ userId: "user-abc" });
    expect(callArg).not.toHaveProperty("email");
  });
});
