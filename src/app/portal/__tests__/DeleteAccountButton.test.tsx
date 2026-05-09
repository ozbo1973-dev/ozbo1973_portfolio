import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const { mockDeleteAccountAction } = vi.hoisted(() => ({
  mockDeleteAccountAction: vi.fn(),
}));

vi.mock("@/app/actions/deleteAccount", () => ({
  deleteAccountAction: mockDeleteAccountAction,
}));

const { mockSignOut } = vi.hoisted(() => ({
  mockSignOut: vi.fn(),
}));

vi.mock("@/lib/auth/auth-client", () => ({
  authClient: {
    signOut: mockSignOut,
  },
}));

const { mockRouterPush } = vi.hoisted(() => ({
  mockRouterPush: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

import DeleteAccountButton from "../_components/DeleteAccountButton";

describe("DeleteAccountButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignOut.mockResolvedValue(undefined);
    mockRouterPush.mockResolvedValue(undefined);
  });

  it("renders a delete account button", () => {
    render(<DeleteAccountButton />);
    expect(screen.getByRole("button", { name: /delete account/i })).toBeInTheDocument();
  });

  it("opens a confirmation AlertDialog when the button is clicked", async () => {
    render(<DeleteAccountButton />);
    fireEvent.click(screen.getByRole("button", { name: /delete account/i }));
    expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
  });

  it("dialog warns that all submissions will be deleted", async () => {
    render(<DeleteAccountButton />);
    fireEvent.click(screen.getByRole("button", { name: /delete account/i }));
    await screen.findByRole("alertdialog");
    expect(document.body.textContent?.toLowerCase()).toMatch(/submissions/);
  });

  it("does not call deleteAccountAction when dialog is cancelled", async () => {
    render(<DeleteAccountButton />);
    fireEvent.click(screen.getByRole("button", { name: /delete account/i }));
    await screen.findByRole("alertdialog");

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(mockDeleteAccountAction).not.toHaveBeenCalled();
  });

  it("calls deleteAccountAction when confirmed", async () => {
    mockDeleteAccountAction.mockResolvedValue({ success: true });
    render(<DeleteAccountButton />);
    fireEvent.click(screen.getByRole("button", { name: /delete account/i }));
    await screen.findByRole("alertdialog");

    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));

    await waitFor(() => {
      expect(mockDeleteAccountAction).toHaveBeenCalledTimes(1);
    });
  });

  it("signs out and redirects to / after successful deletion", async () => {
    mockDeleteAccountAction.mockResolvedValue({ success: true });
    render(<DeleteAccountButton />);
    fireEvent.click(screen.getByRole("button", { name: /delete account/i }));
    await screen.findByRole("alertdialog");

    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockRouterPush).toHaveBeenCalledWith("/");
    });
  });

  it("does not sign out or redirect when deleteAccountAction fails", async () => {
    mockDeleteAccountAction.mockResolvedValue({ success: false, error: "Server error" });
    render(<DeleteAccountButton />);
    fireEvent.click(screen.getByRole("button", { name: /delete account/i }));
    await screen.findByRole("alertdialog");

    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));

    await waitFor(() => {
      expect(mockDeleteAccountAction).toHaveBeenCalledTimes(1);
    });
    expect(mockSignOut).not.toHaveBeenCalled();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });
});
