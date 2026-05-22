import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ReplyNotificationEmail } from "../reply-notification-email";

describe("ReplyNotificationEmail", () => {
  it("renders the sender name and reply body", () => {
    render(<ReplyNotificationEmail senderName="Brady" replyBody="Thanks for reaching out!" />);

    expect(screen.getByRole("heading", { name: /Brady/ })).toBeInTheDocument();
    expect(screen.getByText("Thanks for reaching out!")).toBeInTheDocument();
  });

  it("renders a sign-in button linking to the magic link URL when provided", () => {
    render(
      <ReplyNotificationEmail
        senderName="Brady"
        replyBody="Here is my reply."
        magicLinkUrl="https://example.com/magic"
      />
    );

    const link = screen.getByRole("link", { name: /sign in/i });
    expect(link).toHaveAttribute("href", "https://example.com/magic");
  });

  it("does not render a sign-in button when magicLinkUrl is absent", () => {
    render(<ReplyNotificationEmail senderName="Brady" replyBody="No magic link here." />);

    expect(screen.queryByRole("link", { name: /sign in/i })).toBeNull();
  });
});
