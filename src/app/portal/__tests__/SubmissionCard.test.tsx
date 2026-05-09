import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const { mockDeleteSubmissionAction } = vi.hoisted(() => ({
  mockDeleteSubmissionAction: vi.fn(),
}));

vi.mock("@/app/actions/deleteSubmission", () => ({
  deleteSubmissionAction: mockDeleteSubmissionAction,
}));

import SubmissionCard from "../_components/SubmissionCard";

const submission = {
  id: "sub-1",
  firstName: "Alice",
  lastName: "Smith",
  email: "alice@example.com",
  description: "Build me a portfolio site",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-02"),
};

describe("SubmissionCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders submission description", () => {
    render(<SubmissionCard submission={submission} />);
    expect(screen.getByText("Build me a portfolio site")).toBeInTheDocument();
  });

  it("renders a delete button", () => {
    render(<SubmissionCard submission={submission} />);
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("opens a confirmation dialog when delete is clicked", async () => {
    render(<SubmissionCard submission={submission} />);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
  });

  it("does not call deleteSubmissionAction when dialog is cancelled", async () => {
    render(<SubmissionCard submission={submission} />);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    await screen.findByRole("alertdialog");

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(mockDeleteSubmissionAction).not.toHaveBeenCalled();
  });

  it("calls deleteSubmissionAction with the submission id when confirmed", async () => {
    mockDeleteSubmissionAction.mockResolvedValue({ success: true });
    render(<SubmissionCard submission={submission} />);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    await screen.findByRole("alertdialog");

    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));

    await waitFor(() => {
      expect(mockDeleteSubmissionAction).toHaveBeenCalledWith("sub-1");
    });
  });

  it("removes the card from the DOM after successful deletion", async () => {
    mockDeleteSubmissionAction.mockResolvedValue({ success: true });
    render(<SubmissionCard submission={submission} />);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    await screen.findByRole("alertdialog");

    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));

    await waitFor(() => {
      expect(screen.queryByText("Build me a portfolio site")).not.toBeInTheDocument();
    });
  });

  it("keeps the card visible when deleteSubmissionAction returns failure", async () => {
    mockDeleteSubmissionAction.mockResolvedValue({ success: false, error: "Submission not found" });
    render(<SubmissionCard submission={submission} />);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    await screen.findByRole("alertdialog");

    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));

    await waitFor(() => {
      expect(screen.queryByText("Build me a portfolio site")).toBeInTheDocument();
    });
  });
});
