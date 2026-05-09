import { vi, describe, it, expect, beforeEach } from "vitest";

const { mockVerifySession, mockCreateProspect } = vi.hoisted(() => ({
  mockVerifySession: vi.fn(),
  mockCreateProspect: vi.fn(),
}));

vi.mock("@/lib/dal/prospects", () => ({
  verifySession: mockVerifySession,
}));

vi.mock("@/lib/dal/index", () => ({
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
  firstName: "Alice",
  lastName: "Smith",
  email: "alice@example.com",
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

  it("calls createProspect with userId and description-derived data", async () => {
    await submitPortalRequest({ description: "Need a new website" });

    expect(mockCreateProspect).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "Need a new website",
        email: "alice@example.com",
        userId: "user-abc",
      })
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

  it("returns a fieldError when description is missing", async () => {
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

  it("splits the session name into firstName and lastName", async () => {
    await submitPortalRequest({ description: "Need help" });

    expect(mockCreateProspect).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: "Alice", lastName: "Smith" })
    );
  });

  it("handles single-word name by using it as firstName with empty lastName", async () => {
    mockVerifySession.mockResolvedValue({ ...baseSession, name: "Alice" });

    await submitPortalRequest({ description: "Need help" });

    expect(mockCreateProspect).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: "Alice", lastName: "" })
    );
  });

  it("handles multi-word name by using first word as firstName and rest as lastName", async () => {
    mockVerifySession.mockResolvedValue({ ...baseSession, name: "Alice Marie Smith" });

    await submitPortalRequest({ description: "Need help" });

    expect(mockCreateProspect).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: "Alice", lastName: "Marie Smith" })
    );
  });

  it("returns error when createProspect throws", async () => {
    mockCreateProspect.mockRejectedValue(new Error("DB error"));

    const result = await submitPortalRequest({ description: "Need help" });

    expect(result).toEqual({ success: false, error: expect.any(String) });
  });
});
