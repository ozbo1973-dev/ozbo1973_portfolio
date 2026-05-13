import { vi, describe, it, expect, beforeEach } from "vitest";

const { mockFindOne, mockUpdateOne } = vi.hoisted(() => ({
  mockFindOne: vi.fn(),
  mockUpdateOne: vi.fn(),
}));

vi.mock("@/lib/db/connect", () => ({ default: vi.fn() }));

vi.mock("@/lib/models/SuspiciousID", () => ({
  default: {
    findOne: mockFindOne,
    updateOne: mockUpdateOne,
  },
}));

import { isIPSuspicious, recordSuspiciousIP } from "@/lib/dal/security";

describe("isIPSuspicious", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true when the IP exists in the suspicious list", async () => {
    mockFindOne.mockResolvedValue({ ip: "1.2.3.4", reason: "spam" });

    const result = await isIPSuspicious("1.2.3.4");

    expect(result).toBe(true);
    expect(mockFindOne).toHaveBeenCalledWith({ ip: "1.2.3.4" });
  });

  it("returns false when the IP is not in the suspicious list", async () => {
    mockFindOne.mockResolvedValue(null);

    const result = await isIPSuspicious("9.9.9.9");

    expect(result).toBe(false);
  });
});

describe("recordSuspiciousIP", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("upserts the IP with reason using $setOnInsert", async () => {
    mockUpdateOne.mockResolvedValue({ upsertedCount: 1 });

    await recordSuspiciousIP("5.6.7.8", "honeypot");

    expect(mockUpdateOne).toHaveBeenCalledWith(
      { ip: "5.6.7.8" },
      expect.objectContaining({ $setOnInsert: expect.objectContaining({ ip: "5.6.7.8", reason: "honeypot" }) }),
      { upsert: true }
    );
  });
});
