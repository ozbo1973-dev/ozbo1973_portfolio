import { vi, describe, it, expect, beforeEach } from "vitest";

const { mockVerifyAdminSession, mockCreateAdminReply } = vi.hoisted(() => ({
  mockVerifyAdminSession: vi.fn(),
  mockCreateAdminReply: vi.fn(),
}));

vi.mock("@/lib/dal/admin", () => ({
  verifyAdminSession: mockVerifyAdminSession,
  createAdminReply: mockCreateAdminReply,
}));

import { createAdminReplyAction } from "../createAdminReply";

const adminSession = { userId: "admin-1", email: "admin@example.com", name: "Admin" };

const replyRecord = {
  id: "reply-new",
  userId: "admin-1",
  description: "Great question!",
  createdAt: new Date("2024-01-02"),
  updatedAt: new Date("2024-01-02"),
  archivedAt: null,
  replyCount: 0,
  sender: { name: "Admin", email: "admin@example.com" },
};

describe("createAdminReplyAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyAdminSession.mockResolvedValue(adminSession);
    mockCreateAdminReply.mockResolvedValue(replyRecord);
  });

  it("returns success with reply when input is valid", async () => {
    const result = await createAdminReplyAction("root-1", "Great question!");

    expect(result).toEqual({ success: true, reply: replyRecord });
  });

  it("calls createAdminReply with rootId, body, and admin session", async () => {
    await createAdminReplyAction("root-1", "Great question!");

    expect(mockCreateAdminReply).toHaveBeenCalledWith("root-1", "Great question!", adminSession);
  });

  it("rejects unauthenticated or non-Admin caller by re-throwing redirect", async () => {
    mockVerifyAdminSession.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });

    await expect(createAdminReplyAction("root-1", "Hello")).rejects.toThrow("NEXT_REDIRECT");
  });

  it("returns error when body is empty", async () => {
    const result = await createAdminReplyAction("root-1", "");

    expect(result).toEqual({ success: false, error: expect.any(String) });
    expect(mockCreateAdminReply).not.toHaveBeenCalled();
  });

  it("returns error when body is whitespace only", async () => {
    const result = await createAdminReplyAction("root-1", "   ");

    expect(result).toEqual({ success: false, error: expect.any(String) });
    expect(mockCreateAdminReply).not.toHaveBeenCalled();
  });

  it("returns error when body exceeds max length", async () => {
    const result = await createAdminReplyAction("root-1", "a".repeat(5001));

    expect(result).toEqual({ success: false, error: expect.any(String) });
    expect(mockCreateAdminReply).not.toHaveBeenCalled();
  });

  it("returns error when DAL throws", async () => {
    mockCreateAdminReply.mockRejectedValue(new Error("DB error"));

    const result = await createAdminReplyAction("root-1", "Valid reply");

    expect(result).toEqual({ success: false, error: expect.any(String) });
  });
});
