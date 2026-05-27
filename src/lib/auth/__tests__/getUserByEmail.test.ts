import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/lib/auth/auth", () => ({
  db: {
    collection: vi.fn(),
  },
}));

import { db } from "@/lib/auth/auth";
import { getUserByEmail } from "@/lib/auth/getUserByEmail";

const mockCollection = db.collection as ReturnType<typeof vi.fn>;

function makeCollection(doc: Record<string, unknown> | null) {
  return { findOne: vi.fn().mockResolvedValue(doc) };
}

describe("getUserByEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when no user matches the email", async () => {
    mockCollection.mockReturnValue(makeCollection(null));

    const result = await getUserByEmail("notfound@example.com");

    expect(result).toBeNull();
  });

  it("returns full shape { id, role, emailVerified } when a user exists", async () => {
    mockCollection.mockReturnValue(
      makeCollection({ _id: "abc123", role: "admin", emailVerified: true })
    );

    const result = await getUserByEmail("admin@example.com");

    expect(result).toEqual({ id: "abc123", role: "admin", emailVerified: true });
  });

  it("defaults role to null when the user document has no role field", async () => {
    mockCollection.mockReturnValue(
      makeCollection({ _id: "def456", emailVerified: false })
    );

    const result = await getUserByEmail("user@example.com");

    expect(result).toEqual({ id: "def456", role: null, emailVerified: false });
  });
});
