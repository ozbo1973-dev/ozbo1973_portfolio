import { vi, describe, it, expect, beforeEach } from "vitest";

const { mockDeleteAllSubmissionsByUser, mockDeleteUser } = vi.hoisted(() => ({
  mockDeleteAllSubmissionsByUser: vi.fn(),
  mockDeleteUser: vi.fn(),
}));

vi.mock("@/lib/dal/index", () => ({
  deleteAllSubmissionsByUser: mockDeleteAllSubmissionsByUser,
}));

vi.mock("@/lib/auth/auth", () => ({
  auth: {
    $context: Promise.resolve({
      internalAdapter: { deleteUser: mockDeleteUser },
    }),
  },
}));

import { deleteUser } from "@/lib/dal/users";

describe("deleteUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteAllSubmissionsByUser.mockResolvedValue(0);
    mockDeleteUser.mockResolvedValue(undefined);
  });

  it("removes all submissions for the given user", async () => {
    mockDeleteAllSubmissionsByUser.mockResolvedValue(3);

    await deleteUser("user-abc");

    expect(mockDeleteAllSubmissionsByUser).toHaveBeenCalledWith("user-abc");
  });

  it("removes the BetterAuth user record", async () => {
    await deleteUser("user-abc");

    expect(mockDeleteUser).toHaveBeenCalledWith("user-abc");
  });

  it("does not delete other users' submissions — scopes cascade to the given userId", async () => {
    await deleteUser("user-abc");

    const callArg = mockDeleteAllSubmissionsByUser.mock.calls[0][0];
    expect(callArg).toBe("user-abc");
    expect(mockDeleteAllSubmissionsByUser).toHaveBeenCalledTimes(1);
  });

  it("deletes submissions before removing the user record", async () => {
    const order: string[] = [];
    mockDeleteAllSubmissionsByUser.mockImplementation(async () => {
      order.push("submissions");
      return 0;
    });
    mockDeleteUser.mockImplementation(async () => {
      order.push("user");
    });

    await deleteUser("user-abc");

    expect(order).toEqual(["submissions", "user"]);
  });
});
