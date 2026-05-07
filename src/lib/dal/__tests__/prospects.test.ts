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
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { verifySession } from "@/lib/dal/prospects";

const mockHeaders = headers as ReturnType<typeof vi.fn>;
const mockGetSession = auth.api.getSession as ReturnType<typeof vi.fn>;
const mockRedirect = redirect as ReturnType<typeof vi.fn>;

describe("verifySession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns userId and email when a valid session exists", async () => {
    mockHeaders.mockResolvedValue({ get: () => null });
    mockGetSession.mockResolvedValue({
      session: { userId: "user-123" },
      user: { email: "alice@example.com" },
    });

    const result = await verifySession();

    expect(result).toEqual({ userId: "user-123", email: "alice@example.com" });
  });

  it("redirects to / when no session exists", async () => {
    mockHeaders.mockResolvedValue({ get: () => null });
    mockGetSession.mockResolvedValue(null);
    mockRedirect.mockImplementation(() => { throw new Error("NEXT_REDIRECT"); });

    await expect(verifySession()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/");
  });
});

import { getSubmissionsByUserId } from "@/lib/dal/prospects";

describe("getSubmissionsByUserId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns records matching userId and email from session", async () => {
    mockHeaders.mockResolvedValue({ get: () => null });
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
    ];
    mockFind.mockResolvedValue(mockDocs);

    const results = await getSubmissionsByUserId();

    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({
        $or: expect.arrayContaining([{ userId: "user-abc" }]),
      })
    );
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ id: "doc-1", firstName: "Alice" });
  });

  it("returns empty array when no submissions exist", async () => {
    mockHeaders.mockResolvedValue({ get: () => null });
    mockGetSession.mockResolvedValue({
      session: { userId: "user-none" },
      user: { email: "nobody@example.com" },
    });
    mockFind.mockResolvedValue([]);

    const results = await getSubmissionsByUserId();

    expect(results).toEqual([]);
  });

  it("redirects to / when no session", async () => {
    mockHeaders.mockResolvedValue({ get: () => null });
    mockGetSession.mockResolvedValue(null);
    mockRedirect.mockImplementation(() => { throw new Error("NEXT_REDIRECT"); });

    await expect(getSubmissionsByUserId()).rejects.toThrow("NEXT_REDIRECT");
  });
});
