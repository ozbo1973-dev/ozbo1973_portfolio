import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

const { mockSignOut } = vi.hoisted(() => ({
  mockSignOut: vi.fn(),
}));

vi.mock("@/lib/auth/auth-client", () => ({
  authClient: {
    signOut: mockSignOut,
  },
}));

import { SignOutButton } from "../sign-out-button";

describe("SignOutButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignOut.mockImplementation(async (opts) => {
      opts?.fetchOptions?.onSuccess?.();
    });
  });

  it("calls signOut and redirects to home when clicked", async () => {
    render(<SignOutButton />);

    fireEvent.click(screen.getByRole("button", { name: /sign out/i }));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("refreshes the router so the server-gated contact form re-renders", async () => {
    render(<SignOutButton />);

    fireEvent.click(screen.getByRole("button", { name: /sign out/i }));

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });
});
