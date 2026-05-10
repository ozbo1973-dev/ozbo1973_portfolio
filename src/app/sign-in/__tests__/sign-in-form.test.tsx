import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

const { mockSignIn } = vi.hoisted(() => ({
  mockSignIn: vi.fn(),
}));

vi.mock("@/lib/auth/actions/signIn", () => ({
  signIn: mockSignIn,
}));

import { SignInForm } from "../_components/sign-in-form";

describe("SignInForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignIn.mockResolvedValue({ success: true });
  });

  it("renders email input and submit button initially", () => {
    render(<SignInForm />);
    expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send sign-in link/i })).toBeInTheDocument();
  });

  it("shows confirmation and hides the form after successful submission", async () => {
    render(<SignInForm />);

    const input = screen.getByRole("textbox", { name: /email/i });
    fireEvent.change(input, { target: { value: "user@example.com" } });

    await act(async () => {
      fireEvent.submit(input.closest("form")!);
    });

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("shows confirmation even when signIn action throws", async () => {
    mockSignIn.mockRejectedValue(new Error("network error"));
    render(<SignInForm />);

    const input = screen.getByRole("textbox", { name: /email/i });
    fireEvent.change(input, { target: { value: "user@example.com" } });

    await act(async () => {
      fireEvent.submit(input.closest("form")!);
    });

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("shows confirmation immediately when initialSent is true", () => {
    render(<SignInForm initialSent />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
