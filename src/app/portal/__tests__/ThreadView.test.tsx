import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/app/actions/createUserReply", () => ({
  createUserReplyAction: vi.fn(),
}));

import ThreadView from "../_components/ThreadView";

const userId = "user-1";

const thread = {
  root: {
    id: "root-1",
    userId,
    description: "Initial request",
    createdAt: new Date("2024-01-01"),
  },
  replies: [],
  latestActivity: new Date("2024-01-01"),
};

describe("ThreadView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows reply form when isArchived is false", () => {
    render(<ThreadView thread={thread} currentUserId={userId} isArchived={false} />);
    expect(screen.getByRole("textbox", { name: /reply body/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send reply/i })).toBeInTheDocument();
  });

  it("hides reply form when isArchived is true", () => {
    render(<ThreadView thread={thread} currentUserId={userId} isArchived={true} />);
    expect(screen.queryByRole("textbox", { name: /reply body/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /send reply/i })).not.toBeInTheDocument();
  });

  it("shows reply form by default (isArchived defaults to false)", () => {
    render(<ThreadView thread={thread} currentUserId={userId} />);
    expect(screen.getByRole("textbox", { name: /reply body/i })).toBeInTheDocument();
  });
});
