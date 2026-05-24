import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/db/connect", () => ({ default: vi.fn() }));

const {
  mockFind,
  mockSort,
  mockFindOne,
  mockFindMongo,
  mockToArray,
  mockFindByIdAndUpdate,
  mockFindByIdAndDelete,
  mockFindById,
  mockUpdateMany,
  mockDeleteMany,
  mockCreate,
} = vi.hoisted(() => ({
  mockFind: vi.fn(),
  mockSort: vi.fn(),
  mockFindOne: vi.fn(),
  mockFindMongo: vi.fn(),
  mockToArray: vi.fn(),
  mockFindByIdAndUpdate: vi.fn(),
  mockFindByIdAndDelete: vi.fn(),
  mockFindById: vi.fn(),
  mockUpdateMany: vi.fn(),
  mockDeleteMany: vi.fn(),
  mockCreate: vi.fn(),
}));

vi.mock("@/lib/auth/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
  db: {
    collection: vi.fn((name: string) => {
      if (name === "user") {
        return {
          findOne: mockFindOne,
          find: mockFindMongo,
        };
      }
      return {};
    }),
  },
}));

vi.mock("@/lib/models/ProspectiveCustomer", () => ({
  default: {
    find: mockFind,
    findById: mockFindById,
    findByIdAndUpdate: mockFindByIdAndUpdate,
    findByIdAndDelete: mockFindByIdAndDelete,
    updateMany: mockUpdateMany,
    deleteMany: mockDeleteMany,
    create: mockCreate,
  },
}));

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import {
  verifyAdminSession,
  getInbox,
  getArchived,
  archiveSubmission,
  adminDeleteSubmission,
  getThread,
  createAdminReply,
  getRootSubmissionOwner,
} from "@/lib/dal/admin";

const mockHeaders = headers as unknown as ReturnType<typeof vi.fn>;
const mockGetSession = auth.api.getSession as unknown as ReturnType<
  typeof vi.fn
>;
const mockRedirect = redirect as unknown as ReturnType<typeof vi.fn>;

describe("verifyAdminSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHeaders.mockResolvedValue({ get: () => null });
    mockRedirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });
  });

  it("redirects to / when no session exists", async () => {
    mockGetSession.mockResolvedValue(null);

    await expect(verifyAdminSession()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/");
  });

  it("redirects to / when user has no role", async () => {
    mockGetSession.mockResolvedValue({
      session: { userId: "aaaaaaaaaaaaaaaaaaaaaaaa" },
      user: { email: "alice@example.com", name: "Alice" },
    });
    mockFindOne.mockResolvedValue({
      id: "aaaaaaaaaaaaaaaaaaaaaaaa",
      email: "alice@example.com",
      name: "Alice",
    });

    await expect(verifyAdminSession()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/");
  });

  it("redirects to / when user role is not admin", async () => {
    mockGetSession.mockResolvedValue({
      session: { userId: "aaaaaaaaaaaaaaaaaaaaaaaa" },
      user: { email: "alice@example.com", name: "Alice" },
    });
    mockFindOne.mockResolvedValue({
      id: "aaaaaaaaaaaaaaaaaaaaaaaa",
      email: "alice@example.com",
      name: "Alice",
      role: "user",
    });

    await expect(verifyAdminSession()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/");
  });

  it("returns session data when user is admin", async () => {
    mockGetSession.mockResolvedValue({
      session: { userId: "bbbbbbbbbbbbbbbbbbbbbbbb" },
      user: { email: "admin@example.com", name: "Admin User" },
    });
    mockFindOne.mockResolvedValue({
      id: "bbbbbbbbbbbbbbbbbbbbbbbb",
      email: "admin@example.com",
      name: "Admin User",
      role: "admin",
    });

    const result = await verifyAdminSession();

    expect(result).toEqual({
      userId: "bbbbbbbbbbbbbbbbbbbbbbbb",
      email: "admin@example.com",
      name: "Admin User",
    });
  });

  it("redirects when user doc not found in DB", async () => {
    mockGetSession.mockResolvedValue({
      session: { userId: "cccccccccccccccccccccccc" },
      user: { email: "ghost@example.com", name: "Ghost" },
    });
    mockFindOne.mockResolvedValue(null);

    await expect(verifyAdminSession()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/");
  });
});

function setupFindMockWithReplies(
  rootDocs: object[],
  replyDocs: object[] = [],
) {
  mockFind.mockImplementation((filter: Record<string, unknown>) => {
    if (filter && "parentId" in filter && filter.parentId !== null) {
      return replyDocs;
    }
    return { sort: mockSort };
  });
  mockSort.mockResolvedValue(rootDocs);
}

describe("getInbox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("filters submissions where archivedAt is null", async () => {
    setupFindMockWithReplies([]);
    mockFindMongo.mockReturnValue({ toArray: mockToArray });
    mockToArray.mockResolvedValue([]);

    await getInbox();

    expect(mockFind).toHaveBeenCalledWith({ archivedAt: null, parentId: null });
  });

  it("sorts by createdAt descending", async () => {
    setupFindMockWithReplies([]);
    mockFindMongo.mockReturnValue({ toArray: mockToArray });
    mockToArray.mockResolvedValue([]);

    await getInbox();

    expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
  });

  it("joins sender info from BetterAuth user collection", async () => {
    const doc = {
      _id: { toString: () => "sub-1" },
      userId: "aaaaaaaaaaaaaaaaaaaaaaaa",
      description: "Need a website",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-02"),
      archivedAt: null,
    };
    setupFindMockWithReplies([doc]);
    mockFindMongo.mockReturnValue({ toArray: mockToArray });
    mockToArray.mockResolvedValue([
      {
        _id: { toString: () => "aaaaaaaaaaaaaaaaaaaaaaaa" },
        name: "Alice Smith",
        email: "alice@example.com",
      },
    ]);

    const results = await getInbox();

    expect(results[0].sender).toEqual({
      name: "Alice Smith",
      email: "alice@example.com",
    });
  });

  it("handles orphan submissions with fallback sender label", async () => {
    const doc = {
      _id: { toString: () => "sub-orphan" },
      userId: "dddddddddddddddddddddddd",
      description: "Orphan submission",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-02"),
      archivedAt: null,
    };
    setupFindMockWithReplies([doc]);
    mockFindMongo.mockReturnValue({ toArray: mockToArray });
    mockToArray.mockResolvedValue([]);

    const results = await getInbox();

    expect(results[0].sender).toEqual({ name: "Unknown", email: "unknown" });
  });

  it("returns empty array when no inbox submissions exist", async () => {
    setupFindMockWithReplies([]);
    mockFindMongo.mockReturnValue({ toArray: mockToArray });
    mockToArray.mockResolvedValue([]);

    const results = await getInbox();

    expect(results).toEqual([]);
  });

  it("includes replyCount of 0 when no replies exist", async () => {
    const validUserId = "aaaaaaaaaaaaaaaaaaaaaaaa";
    const doc = {
      _id: { toString: () => "sub-000000000001" },
      userId: validUserId,
      description: "Need a website",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-02"),
      archivedAt: null,
    };
    setupFindMockWithReplies([doc], []);
    mockFindMongo.mockReturnValue({ toArray: mockToArray });
    mockToArray.mockResolvedValue([
      {
        _id: { toString: () => validUserId },
        name: "Alice",
        email: "alice@example.com",
      },
    ]);

    const results = await getInbox();

    expect(results[0].replyCount).toBe(0);
  });

  it("includes correct replyCount when replies exist", async () => {
    const validUserId = "aaaaaaaaaaaaaaaaaaaaaaaa";
    const doc = {
      _id: { toString: () => "sub-000000000001" },
      userId: validUserId,
      description: "Need a website",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-02"),
      archivedAt: null,
    };
    const replyDocs = [
      { parentId: { toString: () => "sub-000000000001" } },
      { parentId: { toString: () => "sub-000000000001" } },
    ];
    setupFindMockWithReplies([doc], replyDocs);
    mockFindMongo.mockReturnValue({ toArray: mockToArray });
    mockToArray.mockResolvedValue([
      {
        _id: { toString: () => validUserId },
        name: "Alice",
        email: "alice@example.com",
      },
    ]);

    const results = await getInbox();

    expect(results[0].replyCount).toBe(2);
  });
});

describe("getArchived", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("filters submissions where archivedAt is not null", async () => {
    setupFindMockWithReplies([]);
    mockFindMongo.mockReturnValue({ toArray: mockToArray });
    mockToArray.mockResolvedValue([]);

    await getArchived();

    expect(mockFind).toHaveBeenCalledWith({
      archivedAt: { $ne: null },
      parentId: null,
    });
  });

  it("sorts by archivedAt descending", async () => {
    setupFindMockWithReplies([]);
    mockFindMongo.mockReturnValue({ toArray: mockToArray });
    mockToArray.mockResolvedValue([]);

    await getArchived();

    expect(mockSort).toHaveBeenCalledWith({ archivedAt: -1 });
  });

  it("joins sender info from BetterAuth user collection", async () => {
    const archivedAt = new Date("2024-03-01");
    const doc = {
      _id: { toString: () => "sub-arch-1" },
      userId: "eeeeeeeeeeeeeeeeeeeeeeee",
      description: "Archived request",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-03-01"),
      archivedAt,
    };
    setupFindMockWithReplies([doc]);
    mockFindMongo.mockReturnValue({ toArray: mockToArray });
    mockToArray.mockResolvedValue([
      {
        _id: { toString: () => "eeeeeeeeeeeeeeeeeeeeeeee" },
        name: "Bob Jones",
        email: "bob@example.com",
      },
    ]);

    const results = await getArchived();

    expect(results[0].sender).toEqual({
      name: "Bob Jones",
      email: "bob@example.com",
    });
    expect(results[0].archivedAt).toBe(archivedAt);
  });

  it("returns empty array when no archived submissions exist", async () => {
    setupFindMockWithReplies([]);
    mockFindMongo.mockReturnValue({ toArray: mockToArray });
    mockToArray.mockResolvedValue([]);

    const results = await getArchived();

    expect(results).toEqual([]);
  });
});

describe("archiveSubmission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindByIdAndUpdate.mockResolvedValue(null);
    mockUpdateMany.mockResolvedValue({ modifiedCount: 0 });
  });

  it("sets archivedAt to a Date on the root submission", async () => {
    await archiveSubmission("sub-1");

    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
      "sub-1",
      expect.objectContaining({ archivedAt: expect.any(Date) }),
    );
  });

  it("cascades archivedAt to all replies where parentId matches", async () => {
    await archiveSubmission("sub-1");

    expect(mockUpdateMany).toHaveBeenCalledWith(
      { parentId: "sub-1" },
      expect.objectContaining({ archivedAt: expect.any(Date) }),
    );
  });

  it("uses the same archivedAt timestamp for root and replies", async () => {
    await archiveSubmission("sub-1");

    const rootCall = mockFindByIdAndUpdate.mock.calls[0];
    const repliesCall = mockUpdateMany.mock.calls[0];
    expect(rootCall[1].archivedAt).toEqual(repliesCall[1].archivedAt);
  });

  it("archives root and all replies in a single operation (parallel)", async () => {
    await archiveSubmission("sub-already-archived");

    expect(mockFindByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(mockUpdateMany).toHaveBeenCalledTimes(1);
  });
});

describe("adminDeleteSubmission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindByIdAndDelete.mockResolvedValue(null);
    mockDeleteMany.mockResolvedValue({ deletedCount: 0 });
  });

  it("deletes the root submission", async () => {
    await adminDeleteSubmission("sub-to-delete");

    expect(mockFindByIdAndDelete).toHaveBeenCalledWith("sub-to-delete");
  });

  it("cascades delete to all replies where parentId matches", async () => {
    await adminDeleteSubmission("sub-to-delete");

    expect(mockDeleteMany).toHaveBeenCalledWith({ parentId: "sub-to-delete" });
  });

  it("deletes root and all replies for both inbox and archived submissions", async () => {
    await adminDeleteSubmission("sub-archived");

    expect(mockFindByIdAndDelete).toHaveBeenCalledTimes(1);
    expect(mockDeleteMany).toHaveBeenCalledTimes(1);
  });
});

describe("getThread", () => {
  const USER_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";
  const ADMIN_ID = "bbbbbbbbbbbbbbbbbbbbbbbb";

  const rootDoc = {
    _id: { toString: () => "root-1" },
    userId: USER_ID,
    description: "Root submission",
    parentId: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    archivedAt: null,
  };

  const replyDoc1 = {
    _id: { toString: () => "reply-1" },
    userId: ADMIN_ID,
    description: "Admin reply",
    parentId: { toString: () => "root-1" },
    createdAt: new Date("2024-01-02"),
    updatedAt: new Date("2024-01-02"),
    archivedAt: null,
  };

  const replyDoc2 = {
    _id: { toString: () => "reply-2" },
    userId: USER_ID,
    description: "User reply",
    parentId: { toString: () => "root-1" },
    createdAt: new Date("2024-01-03"),
    updatedAt: new Date("2024-01-03"),
    archivedAt: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns root submission and replies ordered by createdAt ascending", async () => {
    mockFindById.mockResolvedValue(rootDoc);
    mockSort.mockResolvedValue([replyDoc1, replyDoc2]);
    mockFind.mockReturnValue({ sort: mockSort });
    mockFindMongo.mockReturnValue({ toArray: mockToArray });
    mockToArray.mockResolvedValue([
      {
        _id: { toString: () => USER_ID },
        name: "Alice",
        email: "alice@example.com",
      },
      {
        _id: { toString: () => ADMIN_ID },
        name: "Admin User",
        email: "admin@example.com",
      },
    ]);

    const result = await getThread("root-1");

    expect(result).not.toBeNull();
    expect(result!.root.id).toBe("root-1");
    expect(result!.root.replyCount).toBe(2);
    expect(result!.replies).toHaveLength(2);
    expect(result!.replies[0].id).toBe("reply-1");
    expect(result!.replies[1].id).toBe("reply-2");
  });

  it("queries replies with parentId matching the rootId", async () => {
    mockFindById.mockResolvedValue(rootDoc);
    mockSort.mockResolvedValue([]);
    mockFind.mockReturnValue({ sort: mockSort });
    mockFindMongo.mockReturnValue({ toArray: mockToArray });
    mockToArray.mockResolvedValue([]);

    await getThread("root-1");

    expect(mockFind).toHaveBeenCalledWith({ parentId: "root-1" });
    expect(mockSort).toHaveBeenCalledWith({ createdAt: 1 });
  });

  it("returns null when root submission does not exist", async () => {
    mockFindById.mockResolvedValue(null);

    const result = await getThread("nonexistent-root");

    expect(result).toBeNull();
  });

  it("returns empty replies array when no replies exist", async () => {
    mockFindById.mockResolvedValue(rootDoc);
    mockSort.mockResolvedValue([]);
    mockFind.mockReturnValue({ sort: mockSort });
    mockFindMongo.mockReturnValue({ toArray: mockToArray });
    mockToArray.mockResolvedValue([
      {
        _id: { toString: () => USER_ID },
        name: "Alice",
        email: "alice@example.com",
      },
    ]);

    const result = await getThread("root-1");

    expect(result!.replies).toEqual([]);
  });

  it("joins sender info for both root and reply documents", async () => {
    mockFindById.mockResolvedValue(rootDoc);
    mockSort.mockResolvedValue([replyDoc1]);
    mockFind.mockReturnValue({ sort: mockSort });
    mockFindMongo.mockReturnValue({ toArray: mockToArray });
    mockToArray.mockResolvedValue([
      {
        _id: { toString: () => USER_ID },
        name: "Alice",
        email: "alice@example.com",
      },
      {
        _id: { toString: () => ADMIN_ID },
        name: "Admin User",
        email: "admin@example.com",
      },
    ]);

    const result = await getThread("root-1");

    expect(result!.root.sender).toEqual({
      name: "Alice",
      email: "alice@example.com",
    });
    expect(result!.replies[0].sender).toEqual({
      name: "Admin User",
      email: "admin@example.com",
    });
  });
});

describe("createAdminReply", () => {
  const adminSession = {
    userId: "admin-user-id",
    email: "admin@example.com",
    name: "Admin",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockResolvedValue({
      _id: { toString: () => "reply-new" },
      userId: "admin-user-id",
      description: "Admin reply body",
      parentId: { toString: () => "root-1" },
      createdAt: new Date("2024-01-02"),
      updatedAt: new Date("2024-01-02"),
      archivedAt: null,
    });
  });

  it("creates a reply with parentId set to rootId and userId set to admin's userId", async () => {
    await createAdminReply("root-1", "Admin reply body", adminSession);

    expect(mockCreate).toHaveBeenCalledWith({
      userId: "admin-user-id",
      description: "Admin reply body",
      parentId: "root-1",
    });
  });

  it("returns the created reply record", async () => {
    const result = await createAdminReply(
      "root-1",
      "Admin reply body",
      adminSession,
    );

    expect(result.id).toBe("reply-new");
    expect(result.userId).toBe("admin-user-id");
    expect(result.description).toBe("Admin reply body");
  });

  it("includes sender info from the admin session", async () => {
    const result = await createAdminReply(
      "root-1",
      "Admin reply body",
      adminSession,
    );

    expect(result.sender).toEqual({
      name: "Admin",
      email: "admin@example.com",
    });
  });
});

describe("getRootSubmissionOwner", () => {
  const VALID_USER_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns email and name when root submission and user both exist", async () => {
    mockFindById.mockResolvedValue({
      _id: { toString: () => "root-1" },
      userId: VALID_USER_ID,
    });
    mockFindOne.mockResolvedValue({
      email: "alice@example.com",
      name: "Alice",
    });

    const result = await getRootSubmissionOwner("root-1");

    expect(result).toEqual({ email: "alice@example.com", name: "Alice" });
  });

  it("returns null when the root submission does not exist", async () => {
    mockFindById.mockResolvedValue(null);

    const result = await getRootSubmissionOwner("nonexistent");

    expect(result).toBeNull();
  });

  it("returns null when the user document does not exist", async () => {
    mockFindById.mockResolvedValue({
      _id: { toString: () => "root-1" },
      userId: VALID_USER_ID,
    });
    mockFindOne.mockResolvedValue(null);

    const result = await getRootSubmissionOwner("root-1");

    expect(result).toBeNull();
  });
});
