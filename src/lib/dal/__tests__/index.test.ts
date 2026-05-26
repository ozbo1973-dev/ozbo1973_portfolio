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
  mockFindByIdAndUpdate,
  mockFindOneAndUpdate,
  mockDeleteMany,
} = vi.hoisted(() => ({
  mockFind: vi.fn(),
  mockSort: vi.fn(),
  mockUpdateMany: vi.fn(),
  mockFindOneAndDelete: vi.fn(),
  mockFindByIdAndUpdate: vi.fn(),
  mockFindOneAndUpdate: vi.fn(),
  mockDeleteMany: vi.fn(),
}));

vi.mock("@/lib/models/ProspectiveCustomer", () => ({
  default: {
    create: vi.fn(),
    findByIdAndUpdate: mockFindByIdAndUpdate,
    findOneAndUpdate: mockFindOneAndUpdate,
    find: mockFind,
    updateMany: mockUpdateMany,
    findOneAndDelete: mockFindOneAndDelete,
    deleteMany: mockDeleteMany,
  },
}));

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import {
  getSubmissionsByUserId,
  deleteSubmission,
  userArchiveSubmission,
  getArchivedThreadsByUserId,
} from "@/lib/dal/prospects";

const mockHeaders = headers as unknown as ReturnType<typeof vi.fn>;
const mockGetSession = auth.api.getSession as unknown as ReturnType<typeof vi.fn>;

function makeSession(userId = "user-abc", email = "alice@example.com") {
  return { session: { userId }, user: { email, name: "Alice" } };
}

describe("getSubmissionsByUserId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHeaders.mockResolvedValue({ get: () => null });
  });

  it("returns all ProspectiveCustomer records for the session user", async () => {
    mockGetSession.mockResolvedValue(makeSession());
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
    expect(results[0]).toMatchObject({ id: "doc-1", userId: "user-abc", description: "Need a website" });
    expect(results[1]).toMatchObject({ id: "doc-2", description: "Second inquiry" });
  });

  it("returns an empty array when no submissions exist for the session user", async () => {
    mockGetSession.mockResolvedValue(makeSession("user-no-submissions", "nobody@example.com"));
    mockSort.mockResolvedValue([]);
    mockFind.mockReturnValue({ sort: mockSort });

    const results = await getSubmissionsByUserId();

    expect(results).toEqual([]);
  });

  it("returns records with createdAt and updatedAt timestamps", async () => {
    const createdAt = new Date("2024-03-01");
    const updatedAt = new Date("2024-03-02");
    mockGetSession.mockResolvedValue(makeSession("user-xyz", "bob@example.com"));
    mockSort.mockResolvedValue([
      { _id: { toString: () => "doc-3" }, userId: "user-xyz", description: "Project", createdAt, updatedAt },
    ]);
    mockFind.mockReturnValue({ sort: mockSort });

    const [record] = await getSubmissionsByUserId();

    expect(record.createdAt).toBe(createdAt);
    expect(record.updatedAt).toBe(updatedAt);
  });

  it("redirects when no session exists", async () => {
    const { redirect } = await import("next/navigation");
    const mockRedirect = redirect as unknown as ReturnType<typeof vi.fn>;
    mockRedirect.mockImplementation(() => { throw new Error("NEXT_REDIRECT:/"); });
    mockGetSession.mockResolvedValue(null);

    await expect(getSubmissionsByUserId()).rejects.toThrow("NEXT_REDIRECT:/");
  });
});

describe("deleteSubmission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHeaders.mockResolvedValue({ get: () => null });
  });

  it("returns { deleted: true } when no admin replies exist and submission belongs to user", async () => {
    mockGetSession.mockResolvedValue(makeSession());
    mockFind.mockResolvedValue([]);
    mockFindOneAndDelete.mockResolvedValue({ _id: "doc-1", userId: "user-abc" });
    mockDeleteMany.mockResolvedValue({ deletedCount: 0 });

    const result = await deleteSubmission("doc-1");

    expect(result).toEqual({ deleted: true });
    expect(mockFindOneAndDelete).toHaveBeenCalledWith({ _id: "doc-1", userId: "user-abc" });
  });

  it("returns { deleted: false } when submission belongs to another user", async () => {
    mockGetSession.mockResolvedValue(makeSession());
    mockFind.mockResolvedValue([]);
    mockFindOneAndDelete.mockResolvedValue(null);

    const result = await deleteSubmission("doc-1");

    expect(result).toEqual({ deleted: false });
  });

  it("returns { deleted: false, blocked: true } when admin replies exist", async () => {
    mockGetSession.mockResolvedValue(makeSession());
    mockFind.mockResolvedValue([{ _id: "reply-1", userId: "admin-id" }]);

    const result = await deleteSubmission("doc-1");

    expect(result).toEqual({ deleted: false, blocked: true });
    expect(mockFindOneAndDelete).not.toHaveBeenCalled();
  });

  it("cascades to delete User Replies when the root delete succeeds", async () => {
    mockGetSession.mockResolvedValue(makeSession());
    mockFind.mockResolvedValue([]);
    mockFindOneAndDelete.mockResolvedValue({ _id: "doc-1", userId: "user-abc" });
    mockDeleteMany.mockResolvedValue({ deletedCount: 2 });

    await deleteSubmission("doc-1");

    expect(mockDeleteMany).toHaveBeenCalledWith({ parentId: "doc-1", userId: "user-abc" });
  });

  it("does not cascade when blocked by an Admin Reply", async () => {
    mockGetSession.mockResolvedValue(makeSession());
    mockFind.mockResolvedValue([{ _id: "reply-1", userId: "admin-id" }]);

    await deleteSubmission("doc-1");

    expect(mockFindOneAndDelete).not.toHaveBeenCalled();
    expect(mockDeleteMany).not.toHaveBeenCalled();
  });

  it("does not cascade when root delete finds no matching document", async () => {
    mockGetSession.mockResolvedValue(makeSession());
    mockFind.mockResolvedValue([]);
    mockFindOneAndDelete.mockResolvedValue(null);

    await deleteSubmission("doc-1");

    expect(mockDeleteMany).not.toHaveBeenCalled();
  });

  it("redirects when no session exists", async () => {
    const { redirect } = await import("next/navigation");
    const mockRedirect = redirect as unknown as ReturnType<typeof vi.fn>;
    mockRedirect.mockImplementation(() => { throw new Error("NEXT_REDIRECT:/"); });
    mockGetSession.mockResolvedValue(null);

    await expect(deleteSubmission("doc-1")).rejects.toThrow("NEXT_REDIRECT:/");
  });
});

describe("userArchiveSubmission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHeaders.mockResolvedValue({ get: () => null });
  });

  it("sets archivedAt on the root scoped to session userId", async () => {
    mockGetSession.mockResolvedValue(makeSession());
    mockFindOneAndUpdate.mockResolvedValue({ _id: "root-1", userId: "user-abc" });
    mockUpdateMany.mockResolvedValue({ modifiedCount: 2 });

    await userArchiveSubmission("root-1");

    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: "root-1", userId: "user-abc" },
      expect.objectContaining({ archivedAt: expect.any(Date) }),
    );
  });

  it("cascades archivedAt to replies (reply cascade is unscoped by userId)", async () => {
    mockGetSession.mockResolvedValue(makeSession());
    mockFindOneAndUpdate.mockResolvedValue({ _id: "root-1", userId: "user-abc" });
    mockUpdateMany.mockResolvedValue({ modifiedCount: 1 });

    await userArchiveSubmission("root-1");

    expect(mockUpdateMany).toHaveBeenCalledWith(
      { parentId: "root-1" },
      expect.objectContaining({ archivedAt: expect.any(Date) }),
    );
  });

  it("returns silently without cascading when root is not owned by session user", async () => {
    mockGetSession.mockResolvedValue(makeSession());
    mockFindOneAndUpdate.mockResolvedValue(null);

    await userArchiveSubmission("other-root");

    expect(mockUpdateMany).not.toHaveBeenCalled();
  });

  it("applies the same timestamp to root and replies", async () => {
    mockGetSession.mockResolvedValue(makeSession());
    let capturedRootArchivedAt: Date | undefined;
    let capturedRepliesArchivedAt: Date | undefined;
    mockFindOneAndUpdate.mockImplementation((_filter, update) => {
      capturedRootArchivedAt = update.archivedAt;
      return Promise.resolve({ _id: "root-1" });
    });
    mockUpdateMany.mockImplementation((_filter, update) => {
      capturedRepliesArchivedAt = update.archivedAt;
      return Promise.resolve({ modifiedCount: 0 });
    });

    await userArchiveSubmission("root-1");

    expect(capturedRootArchivedAt).toEqual(capturedRepliesArchivedAt);
  });

  it("redirects when no session exists", async () => {
    const { redirect } = await import("next/navigation");
    const mockRedirect = redirect as unknown as ReturnType<typeof vi.fn>;
    mockRedirect.mockImplementation(() => { throw new Error("NEXT_REDIRECT:/"); });
    mockGetSession.mockResolvedValue(null);

    await expect(userArchiveSubmission("root-1")).rejects.toThrow("NEXT_REDIRECT:/");
  });

  it("cannot archive a Submission owned by another User", async () => {
    mockGetSession.mockResolvedValue(makeSession("user-abc"));
    mockFindOneAndUpdate.mockResolvedValue(null);

    await userArchiveSubmission("other-users-root");

    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: "other-users-root", userId: "user-abc" },
      expect.any(Object),
    );
    expect(mockUpdateMany).not.toHaveBeenCalled();
  });

  it("Admin Replies under User Root are archived alongside (cascade unscoped by userId)", async () => {
    mockGetSession.mockResolvedValue(makeSession());
    mockFindOneAndUpdate.mockResolvedValue({ _id: "root-1", userId: "user-abc" });
    mockUpdateMany.mockResolvedValue({ modifiedCount: 1 });

    await userArchiveSubmission("root-1");

    const updateManyFilter = mockUpdateMany.mock.calls[0][0];
    expect(updateManyFilter).toEqual({ parentId: "root-1" });
    expect(updateManyFilter).not.toHaveProperty("userId");
  });
});

describe("getArchivedThreadsByUserId", () => {
  const mockSortReplies = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockHeaders.mockResolvedValue({ get: () => null });
  });

  function setupFindMock(rootDocs: object[], replyDocs: object[] = []) {
    mockFind.mockImplementation((filter: Record<string, unknown>) => {
      if (filter?.parentId !== null && typeof filter?.parentId === "object" && "$in" in (filter.parentId as object)) {
        return { sort: mockSortReplies };
      }
      return { sort: mockSort };
    });
    mockSort.mockResolvedValue(rootDocs);
    mockSortReplies.mockResolvedValue(replyDocs);
  }

  it("queries archived (archivedAt not null) root submissions for the session user", async () => {
    mockGetSession.mockResolvedValue(makeSession());
    setupFindMock([]);

    await getArchivedThreadsByUserId();

    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-abc", archivedAt: { $ne: null }, parentId: null }),
    );
  });

  it("returns archived threads with their replies", async () => {
    mockGetSession.mockResolvedValue(makeSession());
    const rootDoc = {
      _id: { toString: () => "root-1" },
      userId: "user-abc",
      description: "Archived submission",
      parentId: null,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      archivedAt: new Date("2024-03-01"),
    };
    setupFindMock([rootDoc], []);

    const results = await getArchivedThreadsByUserId();

    expect(results).toHaveLength(1);
    expect(results[0].root.id).toBe("root-1");
  });

  it("returns empty array when no archived submissions exist", async () => {
    mockGetSession.mockResolvedValue(makeSession());
    setupFindMock([]);

    const results = await getArchivedThreadsByUserId();

    expect(results).toEqual([]);
  });

  it("redirects when no session exists", async () => {
    const { redirect } = await import("next/navigation");
    const mockRedirect = redirect as unknown as ReturnType<typeof vi.fn>;
    mockRedirect.mockImplementation(() => { throw new Error("NEXT_REDIRECT:/"); });
    mockGetSession.mockResolvedValue(null);

    await expect(getArchivedThreadsByUserId()).rejects.toThrow("NEXT_REDIRECT:/");
  });
});
