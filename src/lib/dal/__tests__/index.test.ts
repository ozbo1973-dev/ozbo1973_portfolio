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

const { mockFind, mockUpdateMany, mockFindOneAndDelete, mockDeleteMany } = vi.hoisted(() => ({
  mockFind: vi.fn(),
  mockUpdateMany: vi.fn(),
  mockFindOneAndDelete: vi.fn(),
  mockDeleteMany: vi.fn(),
}));

vi.mock("@/lib/models/ProspectiveCustomer", () => ({
  default: {
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    find: mockFind,
    updateMany: mockUpdateMany,
    findOneAndDelete: mockFindOneAndDelete,
    deleteMany: mockDeleteMany,
  },
}));

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { getSubmissionsByUserId } from "@/lib/dal/prospects";
import { deleteSubmission, deleteAllSubmissionsByUser } from "@/lib/dal/index";

const mockHeaders = headers as ReturnType<typeof vi.fn>;
const mockGetSession = auth.api.getSession as ReturnType<typeof vi.fn>;

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
    mockFind.mockResolvedValue(mockDocs);

    const results = await getSubmissionsByUserId();

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      id: "doc-1",
      userId: "user-abc",
      description: "Need a website",
    });
    expect(results[1]).toMatchObject({ id: "doc-2", description: "Second inquiry" });
  });

  it("returns an empty array when no submissions exist for the session user", async () => {
    mockGetSession.mockResolvedValue({
      session: { userId: "user-no-submissions" },
      user: { email: "nobody@example.com" },
    });
    mockFind.mockResolvedValue([]);

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
    mockFind.mockResolvedValue([
      {
        _id: { toString: () => "doc-3" },
        userId: "user-xyz",
        description: "Project",
        createdAt,
        updatedAt,
      },
    ]);

    const [record] = await getSubmissionsByUserId();

    expect(record.createdAt).toBe(createdAt);
    expect(record.updatedAt).toBe(updatedAt);
  });
});

describe("deleteSubmission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true when the submission belongs to the user and is deleted", async () => {
    mockFindOneAndDelete.mockResolvedValue({ _id: "doc-1", userId: "user-abc" });

    const result = await deleteSubmission("doc-1", "user-abc");

    expect(mockFindOneAndDelete).toHaveBeenCalledWith({ _id: "doc-1", userId: "user-abc" });
    expect(result).toBe(true);
  });

  it("returns false and does not delete when the submission belongs to another user", async () => {
    mockFindOneAndDelete.mockResolvedValue(null);

    const result = await deleteSubmission("doc-1", "user-other");

    expect(mockFindOneAndDelete).toHaveBeenCalledWith({ _id: "doc-1", userId: "user-other" });
    expect(result).toBe(false);
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
