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

const { mockFind, mockUpdateMany } = vi.hoisted(() => ({
  mockFind: vi.fn(),
  mockUpdateMany: vi.fn(),
}));

vi.mock("@/lib/models/ProspectiveCustomer", () => ({
  default: {
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    find: mockFind,
    updateMany: mockUpdateMany,
  },
}));

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { getSubmissionsByUserId } from "@/lib/dal/prospects";

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
        firstName: "Alice",
        lastName: "Smith",
        email: "alice@example.com",
        description: "Need a website",
        userId: "user-abc",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
      },
      {
        _id: { toString: () => "doc-2" },
        firstName: "Alice",
        lastName: "Smith",
        email: "alice@example.com",
        description: "Second inquiry",
        userId: "user-abc",
        createdAt: new Date("2024-02-01"),
        updatedAt: new Date("2024-02-02"),
      },
    ];
    mockFind.mockResolvedValue(mockDocs);

    const results = await getSubmissionsByUserId();

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      id: "doc-1",
      firstName: "Alice",
      lastName: "Smith",
      email: "alice@example.com",
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
        firstName: "Bob",
        lastName: "Jones",
        email: "bob@example.com",
        description: "Project",
        userId: "user-xyz",
        createdAt,
        updatedAt,
      },
    ]);

    const [record] = await getSubmissionsByUserId();

    expect(record.createdAt).toBe(createdAt);
    expect(record.updatedAt).toBe(updatedAt);
  });
});
