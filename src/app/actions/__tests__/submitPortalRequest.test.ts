import { vi, describe, it, expect, beforeEach } from "vitest";

const { mockVerifySession, mockCreateProspect } = vi.hoisted(() => ({
  mockVerifySession: vi.fn(),
  mockCreateProspect: vi.fn(),
}));

vi.mock("@/lib/dal/session", () => ({
  verifySession: mockVerifySession,
}));

vi.mock("@/lib/dal/prospects", () => ({
  createProspect: mockCreateProspect,
}));

import { submitPortalRequest } from "../submitPortalRequest";

const baseSession = {
  userId: "user-abc",
  email: "alice@example.com",
  name: "Alice Smith",
};

const baseSubmission = {
  id: "sub-new",
  userId: "user-abc",
  description: "Need a new website",
  createdAt: new Date("2024-03-01"),
  updatedAt: new Date("2024-03-01"),
};

describe("submitPortalRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifySession.mockResolvedValue(baseSession);
    mockCreateProspect.mockResolvedValue(baseSubmission);
  });

  it("returns success with the new submission on valid input", async () => {
    const result = await submitPortalRequest({ description: "Need a new website" });

    expect(result).toEqual({ success: true, submission: baseSubmission });
  });

  it("calls createProspect with only userId and description", async () => {
    await submitPortalRequest({ description: "Need a new website" });

    expect(mockCreateProspect).toHaveBeenCalledWith({
      description: "Need a new website",
      userId: "user-abc",
    });
    expect(mockCreateProspect).toHaveBeenCalledWith(
      expect.not.objectContaining({ firstName: expect.anything() })
    );
    expect(mockCreateProspect).toHaveBeenCalledWith(
      expect.not.objectContaining({ lastName: expect.anything() })
    );
    expect(mockCreateProspect).toHaveBeenCalledWith(
      expect.not.objectContaining({ email: expect.anything() })
    );
  });

  it("returns a fieldError when description is empty", async () => {
    const result = await submitPortalRequest({ description: "" });

    expect(result).toEqual({
      success: false,
      fieldErrors: { description: expect.any(String) },
    });
    expect(mockCreateProspect).not.toHaveBeenCalled();
  });

  it("returns a fieldError when description is whitespace only", async () => {
    const result = await submitPortalRequest({ description: "   " });

    expect(result.success).toBe(false);
    expect(mockCreateProspect).not.toHaveBeenCalled();
  });

  it("redirects when session is invalid", async () => {
    mockVerifySession.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT:/");
    });

    await expect(submitPortalRequest({ description: "Something" })).rejects.toThrow(
      "NEXT_REDIRECT:/"
    );
  });

  it("accepts an optional parentId field", async () => {
    await submitPortalRequest({ description: "Follow-up request", parentId: "parent-123" });

    expect(mockCreateProspect).toHaveBeenCalledWith(
      expect.objectContaining({ parentId: "parent-123" })
    );
  });

  it("returns error when createProspect throws", async () => {
    mockCreateProspect.mockRejectedValue(new Error("DB error"));

    const result = await submitPortalRequest({ description: "Need help" });

    expect(result).toEqual({ success: false, error: expect.any(String) });
  });

  it("succeeds when session.user.name is empty string", async () => {
    mockVerifySession.mockResolvedValue({ userId: "user-abc", email: "alice@example.com", name: "" });

    const result = await submitPortalRequest({ description: "Need a new website" });

    expect(result).toEqual({ success: true, submission: baseSubmission });
    expect(mockCreateProspect).toHaveBeenCalledWith({ userId: "user-abc", description: "Need a new website" });
    expect(mockCreateProspect).toHaveBeenCalledWith(expect.not.objectContaining({ name: expect.anything() }));
  });

  it("succeeds when session.user.name is null (resolved to empty)", async () => {
    mockVerifySession.mockResolvedValue({ userId: "user-abc", email: "alice@example.com", name: null });

    const result = await submitPortalRequest({ description: "Need a new website" });

    expect(result).toEqual({ success: true, submission: baseSubmission });
    expect(mockCreateProspect).toHaveBeenCalledWith({ userId: "user-abc", description: "Need a new website" });
    expect(mockCreateProspect).toHaveBeenCalledWith(expect.not.objectContaining({ name: expect.anything() }));
  });
});
