import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const { mockDeleteSubmissionAction, mockArchiveSubmissionAction } = vi.hoisted(() => ({
  mockDeleteSubmissionAction: vi.fn(),
  mockArchiveSubmissionAction: vi.fn(),
}));

vi.mock("@/app/actions/deleteSubmission", () => ({
  deleteSubmissionAction: mockDeleteSubmissionAction,
}));

vi.mock("@/app/actions/archiveSubmission", () => ({
  archiveSubmissionAction: mockArchiveSubmissionAction,
}));

vi.mock("@/app/actions/createUserReply", () => ({
  createUserReplyAction: vi.fn(),
}));

import ThreadCard from "../_components/ThreadCard";

const userId = "user-1";
const adminId = "admin-1";

const threadNoReplies = {
  root: {
    id: "root-1",
    userId,
    description: "Help me build a site",
    createdAt: new Date("2024-01-01"),
  },
  replies: [],
  latestActivity: new Date("2024-01-01"),
};

const threadWithAdminReply = {
  root: {
    id: "root-2",
    userId,
    description: "Need a portfolio",
    createdAt: new Date("2024-01-01"),
  },
  replies: [
    {
      id: "reply-1",
      userId: adminId,
      description: "Sure, I can help!",
      createdAt: new Date("2024-01-02"),
    },
  ],
  latestActivity: new Date("2024-01-02"),
};

describe("ThreadCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders truncated description", () => {
    render(
      <ThreadCard
        thread={threadNoReplies}
        currentUserId={userId}
        onDeleted={vi.fn()}
        onArchived={vi.fn()}
      />
    );
    expect(screen.getByText("Help me build a site")).toBeInTheDocument();
  });

  it("renders a View Thread button", () => {
    render(
      <ThreadCard
        thread={threadNoReplies}
        currentUserId={userId}
        onDeleted={vi.fn()}
        onArchived={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: /view thread/i })).toBeInTheDocument();
  });

  it("shows reply count badge inside View Thread button when replies exist", () => {
    render(
      <ThreadCard
        thread={threadWithAdminReply}
        currentUserId={userId}
        onDeleted={vi.fn()}
        onArchived={vi.fn()}
      />
    );
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("does not show reply count badge when there are no replies", () => {
    render(
      <ThreadCard
        thread={threadNoReplies}
        currentUserId={userId}
        onDeleted={vi.fn()}
        onArchived={vi.fn()}
      />
    );
    const viewThreadBtn = screen.getByRole("button", { name: /view thread/i });
    expect(viewThreadBtn).not.toHaveTextContent("0");
  });

  it("does not render inline thread messages before View Thread is clicked", () => {
    render(
      <ThreadCard
        thread={threadWithAdminReply}
        currentUserId={userId}
        onDeleted={vi.fn()}
        onArchived={vi.fn()}
      />
    );
    expect(screen.queryByText("Sure, I can help!")).not.toBeInTheDocument();
  });

  it("opens a Sheet showing thread messages when View Thread is clicked", async () => {
    render(
      <ThreadCard
        thread={threadWithAdminReply}
        currentUserId={userId}
        onDeleted={vi.fn()}
        onArchived={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /view thread/i }));
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(screen.getByText("Sure, I can help!")).toBeInTheDocument();
  });

  it("shows reply form in Sheet for active thread (onArchived present)", async () => {
    render(
      <ThreadCard
        thread={threadNoReplies}
        currentUserId={userId}
        onDeleted={vi.fn()}
        onArchived={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /view thread/i }));
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(screen.getByRole("textbox", { name: /reply body/i })).toBeInTheDocument();
  });

  it("hides reply form in Sheet for archived thread (no onArchived)", async () => {
    render(
      <ThreadCard
        thread={threadNoReplies}
        currentUserId={userId}
        onDeleted={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /view thread/i }));
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(screen.queryByRole("textbox", { name: /reply body/i })).not.toBeInTheDocument();
  });

  it("shows Archive button for active thread with admin replies", () => {
    render(
      <ThreadCard
        thread={threadWithAdminReply}
        currentUserId={userId}
        onDeleted={vi.fn()}
        onArchived={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: /archive/i })).toBeInTheDocument();
  });

  it("shows Delete button for thread without admin replies", () => {
    render(
      <ThreadCard
        thread={threadNoReplies}
        currentUserId={userId}
        onDeleted={vi.fn()}
        onArchived={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });
});
