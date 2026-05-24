import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/auth/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("@/lib/db/connect", () => ({ default: vi.fn() }));

const {
  mockFind,
  mockSort,
  mockUpdateMany,
  mockFindOneAndDelete,
  mockDeleteMany,
  mockFindByIdAndUpdate,
} = vi.hoisted(() => ({
  mockFind: vi.fn(),
  mockSort: vi.fn(),
  mockUpdateMany: vi.fn(),
  mockFindOneAndDelete: vi.fn(),
  mockDeleteMany: vi.fn(),
  mockFindByIdAndUpdate: vi.fn(),
}));

vi.mock("@/lib/models/ProspectiveCustomer", () => ({
  default: {
    create: vi.fn(),
    findByIdAndUpdate: mockFindByIdAndUpdate,
    find: mockFind,
    updateMany: mockUpdateMany,
    findOneAndDelete: mockFindOneAndDelete,
    deleteMany: mockDeleteMany,
  },
}));

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { getSubmissionsByUserId } from "@/lib/dal/prospects";
import {
  deleteSubmission,
  deleteAllSubmissionsByUser,
  userArchiveSubmission,
  getArchivedThreadsByUserId,
} from "@/lib/dal/index";

const mockHeaders = headers as unknown as ReturnType<typeof vi.fn>;
const mockGetSession = auth.api.getSession as unknown as ReturnType<
  typeof vi.fn
>;

describe("getSubmissionsByUserId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHeaders.mockResolvedValue({ get: () => null });
  });

  it("returns all ProspectiveCustomer records for the session user", async () => {
    mockGetSession.mockResolvedValue({
      session: { userId: "user-abc" },
      user: { email: "alice@example.com" },
    });
    const mockDocs = [
      {
        _id: { toString: () => "doc-1" },
        userId: "user-abc",
        description: "Need a website",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
      },
      {
        _id: { toString: () => "doc-2" },
        userId: "user-abc",
        description: "Second inquiry",
        createdAt: new Date("2024-02-01"),
        updatedAt: new Date("2024-02-02"),
      },
    ];
    mockSort.mockResolvedValue(mockDocs);
    mockFind.mockReturnValue({ sort: mockSort });

    const results = await getSubmissionsByUserId();

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      id: "doc-1",
      userId: "user-abc",
      description: "Need a website",
    });
    expect(results[1]).toMatchObject({
      id: "doc-2",
      description: "Second inquiry",
    });
  });

  it("returns an empty array when no submissions exist for the session user", async () => {
    mockGetSession.mockResolvedValue({
      session: { userId: "user-no-submissions" },
      user: { email: "nobody@example.com" },
    });
    mockSort.mockResolvedValue([]);
    mockFind.mockReturnValue({ sort: mockSort });

    const results = await getSubmissionsByUserId();

    expect(results).toEqual([]);
  });

  it("returns records with createdAt and updatedAt timestamps", async () => {
    const createdAt = new Date("2024-03-01");
    const updatedAt = new Date("2024-03-02");
    mockGetSession.mockResolvedValue({
      session: { userId: "user-xyz" },
      user: { email: "bob@example.com" },
    });
    mockSort.mockResolvedValue([
      {
        _id: { toString: () => "doc-3" },
        userId: "user-xyz",
        description: "Project",
        createdAt,
        updatedAt,
      },
    ]);
    mockFind.mockReturnValue({ sort: mockSort });

    const [record] = await getSubmissionsByUserId();

    expect(record.createdAt).toBe(createdAt);
    expect(record.updatedAt).toBe(updatedAt);
  });
});

describe("deleteSubmission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns { deleted: true } when no admin replies exist and submission belongs to user", async () => {
    mockFind.mockResolvedValue([]);
    mockFindOneAndDelete.mockResolvedValue({
      _id: "doc-1",
      userId: "user-abc",
    });

    const result = await deleteSubmission("doc-1", "user-abc");

    expect(result).toEqual({ deleted: true });
    expect(mockFindOneAndDelete).toHaveBeenCalledWith({
      _id: "doc-1",
      userId: "user-abc",
    });
  });

  it("returns { deleted: false } when submission belongs to another user", async () => {
    mockFind.mockResolvedValue([]);
    mockFindOneAndDelete.mockResolvedValue(null);

    const result = await deleteSubmission("doc-1", "user-other");

    expect(result).toEqual({ deleted: false });
  });

  it("returns { deleted: false, blocked: true } when admin replies exist", async () => {
    mockFind.mockResolvedValue([{ _id: "reply-1", userId: "admin-id" }]);

    const result = await deleteSubmission("doc-1", "user-abc");

    expect(result).toEqual({ deleted: false, blocked: true });
    expect(mockFindOneAndDelete).not.toHaveBeenCalled();
  });

  it("allows delete when only user replies exist (no admin replies)", async () => {
    // No admin replies (userId not excluded), so find returns empty for admin check
    mockFind.mockResolvedValue([]);
    mockFindOneAndDelete.mockResolvedValue({
      _id: "doc-1",
      userId: "user-abc",
    });

    const result = await deleteSubmission("doc-1", "user-abc");

    expect(result).toEqual({ deleted: true });
    expect(mockFindOneAndDelete).toHaveBeenCalled();
  });
});

describe("userArchiveSubmission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets archivedAt on the root and cascades to all replies", async () => {
    mockFindByIdAndUpdate.mockResolvedValue({});
    mockUpdateMany.mockResolvedValue({ modifiedCount: 2 });

    await userArchiveSubmission("root-1", "user-abc");

    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
      "root-1",
      expect.objectContaining({ archivedAt: expect.any(Date) }),
    );
    expect(mockUpdateMany).toHaveBeenCalledWith(
      { parentId: "root-1" },
      expect.objectContaining({ archivedAt: expect.any(Date) }),
    );
  });

  it("applies the same timestamp to root and replies", async () => {
    let capturedRootArchivedAt: Date | undefined;
    let capturedRepliesArchivedAt: Date | undefined;
    mockFindByIdAndUpdate.mockImplementation((_id, update) => {
      capturedRootArchivedAt = update.archivedAt;
      return Promise.resolve({});
    });
    mockUpdateMany.mockImplementation((_filter, update) => {
      capturedRepliesArchivedAt = update.archivedAt;
      return Promise.resolve({ modifiedCount: 0 });
    });

    await userArchiveSubmission("root-1", "user-abc");

    expect(capturedRootArchivedAt).toEqual(capturedRepliesArchivedAt);
  });
});

describe("getArchivedThreadsByUserId", () => {
  const mockSortReplies = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function setupFindMock(rootDocs: object[], replyDocs: object[] = []) {
    mockFind.mockImplementation((filter: Record<string, unknown>) => {
      if (
        filter &&
        filter.parentId !== null &&
        typeof filter.parentId === "object" &&
        "$in" in (filter.parentId as object)
      ) {
        return { sort: mockSortReplies };
      }
      return { sort: mockSort };
    });
    mockSort.mockResolvedValue(rootDocs);
    mockSortReplies.mockResolvedValue(replyDocs);
  }

  it("queries archived (archivedAt not null) root submissions for the user", async () => {
    setupFindMock([]);

    await getArchivedThreadsByUserId("user-abc");

    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-abc",
        archivedAt: { $ne: null },
        parentId: null,
      }),
    );
  });

  it("returns archived threads with their replies", async () => {
    const archivedAt = new Date("2024-03-01");
    const rootDoc = {
      _id: { toString: () => "root-1" },
      userId: "user-abc",
      description: "Archived submission",
      parentId: null,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      archivedAt,
    };
    setupFindMock([rootDoc], []);

    const results = await getArchivedThreadsByUserId("user-abc");

    expect(results).toHaveLength(1);
    expect(results[0].root.id).toBe("root-1");
  });

  it("returns empty array when no archived submissions exist", async () => {
    setupFindMock([]);

    const results = await getArchivedThreadsByUserId("user-abc");

    expect(results).toEqual([]);
  });
});

describe("deleteAllSubmissionsByUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("removes all submissions for the given user and returns the count", async () => {
    mockDeleteMany.mockResolvedValue({ deletedCount: 3 });

    const count = await deleteAllSubmissionsByUser("user-abc");

    expect(mockDeleteMany).toHaveBeenCalledWith({ userId: "user-abc" });
    expect(count).toBe(3);
  });

  it("scopes the delete query to userId so other users' submissions are not affected", async () => {
    mockDeleteMany.mockResolvedValue({ deletedCount: 2 });

    await deleteAllSubmissionsByUser("user-abc");

    const callArg = mockDeleteMany.mock.calls[0][0];
    expect(callArg).toEqual({ userId: "user-abc" });
    expect(callArg).not.toHaveProperty("email");
  });

  it("returns 0 when the user has no submissions", async () => {
    mockDeleteMany.mockResolvedValue({ deletedCount: 0 });

    const count = await deleteAllSubmissionsByUser("user-no-submissions");

    expect(count).toBe(0);
  });
});
