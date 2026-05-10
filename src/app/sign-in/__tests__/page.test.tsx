import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

const { mockGetSession } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));

vi.mock("@/lib/auth/auth", () => ({
  auth: {
    api: {
      getSession: mockGetSession,
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock("@/lib/auth/actions/signIn", () => ({
  signIn: vi.fn().mockResolvedValue({ success: true }),
}));

import SignInPage from "../page";

describe("SignInPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue(null);
  });

  it("renders an email input form for unauthenticated users", async () => {
    render(await SignInPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
  });

  it("redirects authenticated users to /portal", async () => {
    mockGetSession.mockResolvedValue({ user: { email: "user@example.com" } });

    await expect(SignInPage({ searchParams: Promise.resolve({}) })).rejects.toThrow("NEXT_REDIRECT:/portal");
  });

  it("shows the 'check your inbox' success state immediately when redirected with ?sent=true", async () => {
    render(await SignInPage({ searchParams: Promise.resolve({ sent: "true" }) }));

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("shows a generic confirmation message after form submission regardless of email status", async () => {
    render(await SignInPage({ searchParams: Promise.resolve({}) }));

    const input = screen.getByRole("textbox", { name: /email/i });
    const form = input.closest("form")!;

    fireEvent.change(input, { target: { value: "anyone@example.com" } });
    await act(async () => {
      fireEvent.submit(form);
    });

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
