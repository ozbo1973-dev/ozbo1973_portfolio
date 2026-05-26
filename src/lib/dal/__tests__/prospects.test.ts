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

const { mockFind, mockSort, mockUpdateMany, mockFindById, mockCreate } =
  vi.hoisted(() => ({
    mockFind: vi.fn(),
    mockSort: vi.fn(),
    mockUpdateMany: vi.fn(),
    mockFindById: vi.fn(),
    mockCreate: vi.fn(),
  }));

vi.mock("@/lib/models/ProspectiveCustomer", () => ({
  default: {
    create: mockCreate,
    findByIdAndUpdate: vi.fn(),
    find: mockFind,
    updateMany: mockUpdateMany,
    findById: mockFindById,
  },
}));

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { verifySession } from "@/lib/dal/session";

const mockHeaders = headers as unknown as ReturnType<typeof vi.fn>;
const mockGetSession = auth.api.getSession as unknown as ReturnType<
  typeof vi.fn
>;
const mockRedirect = redirect as unknown as ReturnType<typeof vi.fn>;

describe("verifySession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns userId, email, and name when a valid session exists", async () => {
    mockHeaders.mockResolvedValue({ get: () => null });
    mockGetSession.mockResolvedValue({
      session: { userId: "user-123" },
      user: { email: "alice@example.com", name: "Alice Smith" },
    });

    const result = await verifySession();

    expect(result).toEqual({
      userId: "user-123",
      email: "alice@example.com",
      name: "Alice Smith",
    });
  });

  it("redirects to / when no session exists", async () => {
    mockHeaders.mockResolvedValue({ get: () => null });
    mockGetSession.mockResolvedValue(null);
    mockRedirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });

    await expect(verifySession()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/");
  });
});

import {
  getSubmissionsByUserId,
  getThreadsByUserId,
  createUserReply,
} from "@/lib/dal/prospects";

describe("getSubmissionsByUserId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("queries by userId only (no email-based fallback)", async () => {
    mockHeaders.mockResolvedValue({ get: () => null });
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
    ];
    mockSort.mockResolvedValue(mockDocs);
    mockFind.mockReturnValue({ sort: mockSort });

    const results = await getSubmissionsByUserId();

    expect(mockFind).toHaveBeenCalledWith({ userId: "user-abc" });
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      id: "doc-1",
      description: "Need a website",
    });
  });

  it("sorts results by createdAt descending", async () => {
    mockHeaders.mockResolvedValue({ get: () => null });
    mockGetSession.mockResolvedValue({
      session: { userId: "user-abc" },
      user: { email: "alice@example.com" },
    });

    const mockDocs = [
      {
        _id: { toString: () => "doc-2" },
        userId: "user-abc",
        description: "Newer request",
        createdAt: new Date("2024-02-01"),
        updatedAt: new Date("2024-02-01"),
      },
      {
        _id: { toString: () => "doc-1" },
        userId: "user-abc",
        description: "Older request",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      },
    ];
    mockSort.mockResolvedValue(mockDocs);
    mockFind.mockReturnValue({ sort: mockSort });

    const results = await getSubmissionsByUserId();

    expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(results[0]).toMatchObject({
      id: "doc-2",
      description: "Newer request",
    });
    expect(results[1]).toMatchObject({
      id: "doc-1",
      description: "Older request",
    });
  });

  it("returns empty array when no submissions exist", async () => {
    mockHeaders.mockResolvedValue({ get: () => null });
    mockGetSession.mockResolvedValue({
      session: { userId: "user-none" },
      user: { email: "nobody@example.com" },
    });
    mockSort.mockResolvedValue([]);
    mockFind.mockReturnValue({ sort: mockSort });

    const results = await getSubmissionsByUserId();

    expect(results).toEqual([]);
  });

  it("redirects to / when no session", async () => {
    mockHeaders.mockResolvedValue({ get: () => null });
    mockGetSession.mockResolvedValue(null);
    mockRedirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });

    await expect(getSubmissionsByUserId()).rejects.toThrow("NEXT_REDIRECT");
  });
});

describe("getThreadsByUserId", () => {
  const mockSortReplies = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockHeaders.mockResolvedValue({ get: () => null });
    mockGetSession.mockResolvedValue({
      session: { userId: "user-abc" },
      user: { email: "alice@example.com", name: "Alice" },
    });
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

  it("queries only active (archivedAt: null) root submissions for the user", async () => {
    setupFindMock([]);

    await getThreadsByUserId("user-abc");

    expect(mockFind).toHaveBeenCalledWith({
      userId: "user-abc",
      archivedAt: null,
      parentId: null,
    });
  });

  it("returns threads sorted by most recent activity (latest reply createdAt)", async () => {
    const older = new Date("2024-01-01");
    const newer = new Date("2024-02-01");
    const rootDoc1 = {
      _id: { toString: () => "root-1" },
      userId: "user-abc",
      description: "First submission",
      parentId: null,
      createdAt: older,
      updatedAt: older,
      archivedAt: null,
    };
    const rootDoc2 = {
      _id: { toString: () => "root-2" },
      userId: "user-abc",
      description: "Second submission",
      parentId: null,
      createdAt: older,
      updatedAt: older,
      archivedAt: null,
    };
    const replyForRoot1 = {
      _id: { toString: () => "reply-1" },
      userId: "admin-id",
      description: "Admin reply to root-1",
      parentId: { toString: () => "root-1" },
      createdAt: newer,
      updatedAt: newer,
      archivedAt: null,
    };
    setupFindMock([rootDoc1, rootDoc2], [replyForRoot1]);

    const results = await getThreadsByUserId("user-abc");

    expect(results).toHaveLength(2);
    expect(results[0].root.id).toBe("root-1");
    expect(results[1].root.id).toBe("root-2");
  });

  it("falls back to root createdAt when no replies exist", async () => {
    const date1 = new Date("2024-02-01");
    const date2 = new Date("2024-01-01");
    const rootDoc1 = {
      _id: { toString: () => "root-1" },
      userId: "user-abc",
      description: "Newer root",
      parentId: null,
      createdAt: date1,
      updatedAt: date1,
      archivedAt: null,
    };
    const rootDoc2 = {
      _id: { toString: () => "root-2" },
      userId: "user-abc",
      description: "Older root",
      parentId: null,
      createdAt: date2,
      updatedAt: date2,
      archivedAt: null,
    };
    setupFindMock([rootDoc1, rootDoc2], []);

    const results = await getThreadsByUserId("user-abc");

    expect(results[0].root.id).toBe("root-1");
    expect(results[1].root.id).toBe("root-2");
  });

  it("orders replies within each thread by createdAt ascending", async () => {
    const rootDoc = {
      _id: { toString: () => "root-1" },
      userId: "user-abc",
      description: "Root",
      parentId: null,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      archivedAt: null,
    };
    const reply1 = {
      _id: { toString: () => "reply-1" },
      userId: "admin-id",
      description: "First reply",
      parentId: { toString: () => "root-1" },
      createdAt: new Date("2024-01-02"),
      updatedAt: new Date("2024-01-02"),
      archivedAt: null,
    };
    const reply2 = {
      _id: { toString: () => "reply-2" },
      userId: "user-abc",
      description: "Second reply",
      parentId: { toString: () => "root-1" },
      createdAt: new Date("2024-01-03"),
      updatedAt: new Date("2024-01-03"),
      archivedAt: null,
    };
    setupFindMock([rootDoc], [reply1, reply2]);

    const results = await getThreadsByUserId("user-abc");

    expect(results[0].replies).toHaveLength(2);
    expect(results[0].replies[0].id).toBe("reply-1");
    expect(results[0].replies[1].id).toBe("reply-2");
  });

  it("excludes archived threads (archivedAt not null)", async () => {
    setupFindMock([]);

    const results = await getThreadsByUserId("user-abc");

    expect(results).toEqual([]);
    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({ archivedAt: null }),
    );
  });

  it("returns empty array when no active submissions exist", async () => {
    setupFindMock([]);

    const results = await getThreadsByUserId("user-abc");

    expect(results).toEqual([]);
  });
});

describe("createUserReply", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const rootDoc = {
    _id: { toString: () => "root-1" },
    userId: "user-abc",
    description: "Root submission",
    parentId: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    archivedAt: null,
  };

  it("creates reply with correct parentId and userId", async () => {
    mockFindById.mockResolvedValue(rootDoc);
    const replyDoc = {
      _id: { toString: () => "reply-new" },
      userId: "user-abc",
      description: "Great, thanks!",
      parentId: { toString: () => "root-1" },
      createdAt: new Date("2024-01-02"),
      updatedAt: new Date("2024-01-02"),
    };
    mockCreate.mockResolvedValue(replyDoc);

    await createUserReply("root-1", "user-abc", "Great, thanks!");

    expect(mockCreate).toHaveBeenCalledWith({
      userId: "user-abc",
      description: "Great, thanks!",
      parentId: "root-1",
    });
  });

  it("returns a UserThreadRecord with correct fields", async () => {
    mockFindById.mockResolvedValue(rootDoc);
    const replyDoc = {
      _id: { toString: () => "reply-new" },
      userId: "user-abc",
      description: "Great, thanks!",
      parentId: { toString: () => "root-1" },
      createdAt: new Date("2024-01-02"),
      updatedAt: new Date("2024-01-02"),
    };
    mockCreate.mockResolvedValue(replyDoc);

    const result = await createUserReply(
      "root-1",
      "user-abc",
      "Great, thanks!",
    );

    expect(result).toMatchObject({
      id: "reply-new",
      userId: "user-abc",
      description: "Great, thanks!",
    });
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it("throws when root submission does not belong to requesting user", async () => {
    mockFindById.mockResolvedValue({ ...rootDoc, userId: "other-user" });

    await expect(
      createUserReply("root-1", "user-abc", "Trying to reply"),
    ).rejects.toThrow();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("throws when root submission does not exist", async () => {
    mockFindById.mockResolvedValue(null);

    await expect(
      createUserReply("root-1", "user-abc", "Hello"),
    ).rejects.toThrow();
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
