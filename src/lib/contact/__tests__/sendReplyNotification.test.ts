import { vi, describe, it, expect, beforeEach } from "vitest";

const { mockSend } = vi.hoisted(() => ({
  mockSend: vi.fn(),
}));

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: mockSend },
  })),
}));

vi.mock("@/components/reply-notification-email", () => ({
  ReplyNotificationEmail: vi.fn().mockReturnValue(null),
}));

import { sendReplyNotification } from "../sendNotifications";

describe("sendReplyNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSend.mockResolvedValue({ id: "email-123" });
    vi.stubEnv(process.env.NOTIFICATION_EMAIL, "owner@example.com");
  });

  it("calls Resend with correct to, senderName and replyBody", async () => {
    await sendReplyNotification({
      to: "alice@example.com",
      senderName: "Admin",
      replyBody: "Hello there",
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "alice@example.com",
        subject: expect.stringContaining("Admin"),
      }),
    );
  });

  it("does not throw when Resend fails", async () => {
    mockSend.mockRejectedValue(new Error("Resend down"));

    await expect(
      sendReplyNotification({
        to: "alice@example.com",
        senderName: "Admin",
        replyBody: "Hello",
      }),
    ).resolves.toBeUndefined();
  });

  it("passes magicLinkUrl to the email template when provided", async () => {
    const { ReplyNotificationEmail } =
      await import("@/components/reply-notification-email");

    await sendReplyNotification({
      to: "alice@example.com",
      senderName: "Admin",
      replyBody: "Check this",
      magicLinkUrl: "https://example.com/magic",
    });

    expect(ReplyNotificationEmail).toHaveBeenCalledWith(
      expect.objectContaining({ magicLinkUrl: "https://example.com/magic" }),
    );
  });
});
