import { vi, describe, it, expect, beforeEach } from "vitest";

const { mockFind } = vi.hoisted(() => ({ mockFind: vi.fn() }));

vi.mock("@/lib/db/connect", () => ({ default: vi.fn() }));

vi.mock("@/lib/models/ProspectiveCustomer", () => ({
  default: {
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    find: mockFind,
  },
}));

vi.mock("@/lib/models/SuspiciousID", () => ({
  default: {
    findOne: vi.fn(),
    updateOne: vi.fn(),
  },
}));

import { getSubmissionsByUserId } from "@/lib/dal";

describe("getSubmissionsByUserId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all ProspectiveCustomer records matching the given userId", async () => {
    const userId = "user-abc";
    const mockDocs = [
      {
        _id: { toString: () => "doc-1" },
        firstName: "Alice",
        lastName: "Smith",
        email: "alice@example.com",
        description: "Need a website",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
      },
      {
        _id: { toString: () => "doc-2" },
        firstName: "Alice",
        lastName: "Smith",
        email: "alice@example.com",
        description: "Second inquiry",
        createdAt: new Date("2024-02-01"),
        updatedAt: new Date("2024-02-02"),
      },
    ];
    mockFind.mockResolvedValue(mockDocs);

    const results = await getSubmissionsByUserId(userId);

    expect(mockFind).toHaveBeenCalledWith({ userId });
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

  it("returns an empty array when no submissions exist for the userId", async () => {
    mockFind.mockResolvedValue([]);

    const results = await getSubmissionsByUserId("user-no-submissions");

    expect(results).toEqual([]);
  });

  it("returns records with createdAt and updatedAt timestamps", async () => {
    const createdAt = new Date("2024-03-01");
    const updatedAt = new Date("2024-03-02");
    mockFind.mockResolvedValue([
      {
        _id: { toString: () => "doc-3" },
        firstName: "Bob",
        lastName: "Jones",
        email: "bob@example.com",
        description: "Project",
        createdAt,
        updatedAt,
      },
    ]);

    const [record] = await getSubmissionsByUserId("user-xyz");

    expect(record.createdAt).toBe(createdAt);
    expect(record.updatedAt).toBe(updatedAt);
  });
});
