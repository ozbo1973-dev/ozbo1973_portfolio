import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/db/connect", () => ({ default: vi.fn() }));

const { mockFind, mockSort, mockFindOne, mockFindMongo, mockToArray } = vi.hoisted(() => ({
  mockFind: vi.fn(),
  mockSort: vi.fn(),
  mockFindOne: vi.fn(),
  mockFindMongo: vi.fn(),
  mockToArray: vi.fn(),
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
  },
}));

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { verifyAdminSession, getInbox } from "@/lib/dal/admin";

const mockHeaders = headers as ReturnType<typeof vi.fn>;
const mockGetSession = auth.api.getSession as ReturnType<typeof vi.fn>;
const mockRedirect = redirect as ReturnType<typeof vi.fn>;

describe("verifyAdminSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHeaders.mockResolvedValue({ get: () => null });
    mockRedirect.mockImplementation(() => { throw new Error("NEXT_REDIRECT"); });
  });

  it("redirects to / when no session exists", async () => {
    mockGetSession.mockResolvedValue(null);

    await expect(verifyAdminSession()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/");
  });

  it("redirects to / when user has no role", async () => {
    mockGetSession.mockResolvedValue({
      session: { userId: "user-123" },
      user: { email: "alice@example.com", name: "Alice" },
    });
    mockFindOne.mockResolvedValue({ id: "user-123", email: "alice@example.com", name: "Alice" });

    await expect(verifyAdminSession()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/");
  });

  it("redirects to / when user role is not admin", async () => {
    mockGetSession.mockResolvedValue({
      session: { userId: "user-123" },
      user: { email: "alice@example.com", name: "Alice" },
    });
    mockFindOne.mockResolvedValue({ id: "user-123", email: "alice@example.com", name: "Alice", role: "user" });

    await expect(verifyAdminSession()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/");
  });

  it("returns session data when user is admin", async () => {
    mockGetSession.mockResolvedValue({
      session: { userId: "admin-1" },
      user: { email: "admin@example.com", name: "Admin User" },
    });
    mockFindOne.mockResolvedValue({ id: "admin-1", email: "admin@example.com", name: "Admin User", role: "admin" });

    const result = await verifyAdminSession();

    expect(result).toEqual({ userId: "admin-1", email: "admin@example.com", name: "Admin User" });
  });

  it("redirects when user doc not found in DB", async () => {
    mockGetSession.mockResolvedValue({
      session: { userId: "ghost-user" },
      user: { email: "ghost@example.com", name: "Ghost" },
    });
    mockFindOne.mockResolvedValue(null);

    await expect(verifyAdminSession()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/");
  });
});

describe("getInbox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("filters submissions where archivedAt is null", async () => {
    mockSort.mockResolvedValue([]);
    mockFind.mockReturnValue({ sort: mockSort });
    mockFindMongo.mockReturnValue({ toArray: mockToArray });
    mockToArray.mockResolvedValue([]);

    await getInbox();

    expect(mockFind).toHaveBeenCalledWith({ archivedAt: null });
  });

  it("sorts by createdAt descending", async () => {
    mockSort.mockResolvedValue([]);
    mockFind.mockReturnValue({ sort: mockSort });
    mockFindMongo.mockReturnValue({ toArray: mockToArray });
    mockToArray.mockResolvedValue([]);

    await getInbox();

    expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
  });

  it("joins sender info from BetterAuth user collection", async () => {
    const doc = {
      _id: { toString: () => "sub-1" },
      userId: "user-abc",
      description: "Need a website",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-02"),
      archivedAt: null,
    };
    mockSort.mockResolvedValue([doc]);
    mockFind.mockReturnValue({ sort: mockSort });
    mockFindMongo.mockReturnValue({ toArray: mockToArray });
    mockToArray.mockResolvedValue([{ id: "user-abc", name: "Alice Smith", email: "alice@example.com" }]);

    const results = await getInbox();

    expect(results[0].sender).toEqual({ name: "Alice Smith", email: "alice@example.com" });
  });

  it("handles orphan submissions with fallback sender label", async () => {
    const doc = {
      _id: { toString: () => "sub-orphan" },
      userId: "deleted-user",
      description: "Orphan submission",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-02"),
      archivedAt: null,
    };
    mockSort.mockResolvedValue([doc]);
    mockFind.mockReturnValue({ sort: mockSort });
    mockFindMongo.mockReturnValue({ toArray: mockToArray });
    mockToArray.mockResolvedValue([]);

    const results = await getInbox();

    expect(results[0].sender).toEqual({ name: "Unknown", email: "unknown" });
  });

  it("returns empty array when no inbox submissions exist", async () => {
    mockSort.mockResolvedValue([]);
    mockFind.mockReturnValue({ sort: mockSort });
    mockFindMongo.mockReturnValue({ toArray: mockToArray });
    mockToArray.mockResolvedValue([]);

    const results = await getInbox();

    expect(results).toEqual([]);
  });
});
