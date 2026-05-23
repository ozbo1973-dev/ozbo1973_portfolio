import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const { mockGetThreadAction, mockArchiveSubmissionAction, mockAdminDeleteSubmissionAction } =
  vi.hoisted(() => ({
    mockGetThreadAction: vi.fn(),
    mockArchiveSubmissionAction: vi.fn(),
    mockAdminDeleteSubmissionAction: vi.fn(),
  }));

vi.mock("@/app/actions/admin/getThread", () => ({
  getThreadAction: mockGetThreadAction,
}));

vi.mock("@/app/actions/admin/archiveSubmission", () => ({
  archiveSubmissionAction: mockArchiveSubmissionAction,
}));

vi.mock("@/app/actions/admin/deleteSubmission", () => ({
  adminDeleteSubmissionAction: mockAdminDeleteSubmissionAction,
}));

vi.mock("@/app/actions/admin/createAdminReply", () => ({
  createAdminReplyAction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import AdminContent from "../_components/AdminContent";

const submission = {
  id: "sub-1",
  userId: "user-1",
  description: "Help me with my portfolio",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-02"),
  archivedAt: null,
  replyCount: 1,
  sender: { name: "Alice Smith", email: "alice@example.com" },
};

const thread = {
  root: submission,
  replies: [
    {
      id: "reply-1",
      userId: "admin-1",
      description: "Sure, let me help.",
      createdAt: new Date("2024-01-02"),
      updatedAt: new Date("2024-01-02"),
      archivedAt: null,
      replyCount: 0,
      sender: { name: "Brady Admin", email: "admin@example.com" },
    },
  ],
};

const defaultProps = {
  initialInbox: [submission],
  initialArchived: [],
  adminUserId: "admin-1",
  adminName: "Brady Admin",
  adminEmail: "admin@example.com",
};

describe("AdminContent ThreadPanel as Sheet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not show thread content before View Thread is clicked", () => {
    render(<AdminContent {...defaultProps} />);
    expect(screen.queryByText("Sure, let me help.")).not.toBeInTheDocument();
  });

  it("opens a Sheet with Thread title when View Thread is clicked", async () => {
    mockGetThreadAction.mockResolvedValue({ success: true, thread });
    render(<AdminContent {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /view thread/i }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(screen.getByText(/Thread - Alice Smith/)).toBeInTheDocument();
  });

  it("shows thread messages inside the Sheet", async () => {
    mockGetThreadAction.mockResolvedValue({ success: true, thread });
    render(<AdminContent {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /view thread/i }));

    await waitFor(() => {
      expect(screen.getByText("Sure, let me help.")).toBeInTheDocument();
    });
  });

  it("Sheet closes when the built-in X button is clicked", async () => {
    mockGetThreadAction.mockResolvedValue({ success: true, thread });
    render(<AdminContent {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /view thread/i }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /close/i }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
