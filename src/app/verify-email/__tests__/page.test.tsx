import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

import VerifyEmailPage from "../page";

describe("VerifyEmailPage", () => {
  it("renders a heading that communicates a magic link has been sent", () => {
    render(<VerifyEmailPage />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent?.toLowerCase()).toMatch(/check your email|magic link|email sent/);
  });

  it("renders a message telling the user to check their inbox", () => {
    render(<VerifyEmailPage />);
    const body = document.body.textContent?.toLowerCase() ?? "";
    expect(body).toMatch(/inbox|check your email/);
  });

  it("renders a link back to the home page", () => {
    render(<VerifyEmailPage />);
    const homeLink = screen.getByRole("link");
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.getAttribute("href")).toBe("/");
  });

  it("heading uses Playfair Display font class to match site design", () => {
    render(<VerifyEmailPage />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.className).toMatch(/font-playfair|--font-playfair/);
  });

  it("renders no form elements", () => {
    render(<VerifyEmailPage />);
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
