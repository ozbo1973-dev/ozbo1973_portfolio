import { vi, describe, it, expect, beforeEach } from "vitest";

const { mockVerifySession, mockCreateUserReply } = vi.hoisted(() => ({
  mockVerifySession: vi.fn(),
  mockCreateUserReply: vi.fn(),
}));

vi.mock("@/lib/dal/prospects", () => ({
  verifySession: mockVerifySession,
  createUserReply: mockCreateUserReply,
}));

import { createUserReplyAction } from "../createUserReply";

const userSession = { userId: "user-abc", email: "alice@example.com", name: "Alice" };

const replyRecord = {
  id: "reply-new",
  userId: "user-abc",
  description: "Thanks for the update!",
  createdAt: new Date("2024-01-02"),
};

describe("createUserReplyAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifySession.mockResolvedValue(userSession);
    mockCreateUserReply.mockResolvedValue(replyRecord);
  });

  it("returns success with reply when input is valid", async () => {
    const result = await createUserReplyAction("root-1", "Thanks for the update!");

    expect(result).toEqual({ success: true, reply: replyRecord });
  });

  it("calls createUserReply with rootId, userId from session, and body", async () => {
    await createUserReplyAction("root-1", "Thanks for the update!");

    expect(mockCreateUserReply).toHaveBeenCalledWith("root-1", "user-abc", "Thanks for the update!");
  });

  it("rejects unauthenticated caller by re-throwing redirect", async () => {
    mockVerifySession.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });

    await expect(createUserReplyAction("root-1", "Hello")).rejects.toThrow("NEXT_REDIRECT");
  });

  it("returns error when body is empty", async () => {
    const result = await createUserReplyAction("root-1", "");

    expect(result).toEqual({ success: false, error: expect.any(String) });
    expect(mockCreateUserReply).not.toHaveBeenCalled();
  });

  it("returns error when body is whitespace only", async () => {
    const result = await createUserReplyAction("root-1", "   ");

    expect(result).toEqual({ success: false, error: expect.any(String) });
    expect(mockCreateUserReply).not.toHaveBeenCalled();
  });

  it("returns error when body exceeds max length", async () => {
    const result = await createUserReplyAction("root-1", "a".repeat(5001));

    expect(result).toEqual({ success: false, error: expect.any(String) });
    expect(mockCreateUserReply).not.toHaveBeenCalled();
  });

  it("returns error when ownership check fails (DAL throws)", async () => {
    mockCreateUserReply.mockRejectedValue(new Error("Submission not found or does not belong to user."));

    const result = await createUserReplyAction("root-1", "Valid reply");

    expect(result).toEqual({ success: false, error: expect.any(String) });
  });
});
