import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const { mockGetSession } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
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

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));

// Stub heavy section components to keep tests focused on rendering logic
vi.mock("@/components/sections/hero", () => ({
  default: () => <div data-testid="hero" />,
}));
vi.mock("@/components/sections/about", () => ({
  default: () => <div data-testid="about" />,
}));
vi.mock("@/components/sections/skills", () => ({
  default: () => <div data-testid="skills" />,
}));
vi.mock("@/components/sections/projects", () => ({
  default: () => <div data-testid="projects" />,
}));
vi.mock("@/components/sections/contact", () => ({
  default: () => <section id="contact" data-testid="contact-section" />,
}));

import Home from "../page";

describe("Home page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue(null);
  });

  it("renders the contact section when no session is present", async () => {
    render(await Home());

    expect(screen.getByTestId("contact-section")).toBeInTheDocument();
  });

  it("hides the contact section when a session is present", async () => {
    mockGetSession.mockResolvedValue({ user: { email: "user@example.com" } });

    render(await Home());

    expect(screen.queryByTestId("contact-section")).not.toBeInTheDocument();
  });
});
