import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const { mockSubmitPortalRequest } = vi.hoisted(() => ({
  mockSubmitPortalRequest: vi.fn(),
}));

vi.mock("@/app/actions/submitPortalRequest", () => ({
  submitPortalRequest: mockSubmitPortalRequest,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import NewRequestForm from "../_components/NewRequestForm";
import { toast } from "sonner";

const defaultProps = {
  onSubmitted: vi.fn(),
};

describe("NewRequestForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a description textarea", () => {
    render(<NewRequestForm {...defaultProps} />);
    expect(screen.getByRole("textbox", { name: /description/i })).toBeInTheDocument();
  });

  it("renders a submit button", () => {
    render(<NewRequestForm {...defaultProps} />);
    expect(screen.getByRole("button", { name: /submit|send/i })).toBeInTheDocument();
  });

  it("disables the submit button when description is empty", () => {
    render(<NewRequestForm {...defaultProps} />);

    expect(screen.getByRole("button", { name: /submit|send/i })).toBeDisabled();
    expect(mockSubmitPortalRequest).not.toHaveBeenCalled();
  });

  it("calls submitPortalRequest with the description on valid submission", async () => {
    mockSubmitPortalRequest.mockResolvedValue({ success: true, submission: { id: "sub-new" } });
    render(<NewRequestForm {...defaultProps} />);

    fireEvent.change(screen.getByRole("textbox", { name: /description/i }), {
      target: { value: "Need a new website" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit|send/i }));

    await waitFor(() => {
      expect(mockSubmitPortalRequest).toHaveBeenCalledWith(
        expect.objectContaining({ description: "Need a new website" })
      );
    });
  });

  it("calls onSubmitted with the new submission after success", async () => {
    const submission = {
      id: "sub-new",
      userId: "user-abc",
      description: "Need a new website",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockSubmitPortalRequest.mockResolvedValue({ success: true, submission });
    const onSubmitted = vi.fn();
    render(<NewRequestForm onSubmitted={onSubmitted} />);

    fireEvent.change(screen.getByRole("textbox", { name: /description/i }), {
      target: { value: "Need a new website" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit|send/i }));

    await waitFor(() => {
      expect(onSubmitted).toHaveBeenCalledWith(submission);
    });
  });

  it("shows a success toast after successful submission", async () => {
    mockSubmitPortalRequest.mockResolvedValue({ success: true, submission: { id: "sub-new" } });
    render(<NewRequestForm {...defaultProps} />);

    fireEvent.change(screen.getByRole("textbox", { name: /description/i }), {
      target: { value: "Need a new website" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit|send/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it("shows inline fieldError from server action when present", async () => {
    mockSubmitPortalRequest.mockResolvedValue({
      success: false,
      fieldErrors: { description: "Description too short" },
    });
    render(<NewRequestForm {...defaultProps} />);

    fireEvent.change(screen.getByRole("textbox", { name: /description/i }), {
      target: { value: "Hi" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit|send/i }));

    expect(await screen.findByText("Description too short")).toBeInTheDocument();
  });

  it("clears the description field after successful submission", async () => {
    mockSubmitPortalRequest.mockResolvedValue({ success: true, submission: { id: "sub-new" } });
    render(<NewRequestForm {...defaultProps} />);

    const textarea = screen.getByRole("textbox", { name: /description/i });
    fireEvent.change(textarea, { target: { value: "Need a new website" } });
    fireEvent.click(screen.getByRole("button", { name: /submit|send/i }));

    await waitFor(() => {
      expect((textarea as HTMLTextAreaElement).value).toBe("");
    });
  });

  it("shows a toast error when submission fails", async () => {
    mockSubmitPortalRequest.mockResolvedValue({
      success: false,
      fieldErrors: {},
    });
    render(<NewRequestForm {...defaultProps} />);

    fireEvent.change(screen.getByRole("textbox", { name: /description/i }), {
      target: { value: "Need a new website" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit|send/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
