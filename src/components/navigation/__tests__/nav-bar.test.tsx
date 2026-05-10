import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const { mockUseSession } = vi.hoisted(() => ({
  mockUseSession: vi.fn(),
}));

// Mock auth client
vi.mock("@/lib/auth/auth-client", () => ({
  authClient: {
    useSession: mockUseSession,
  },
}));

// Mock navigation context
vi.mock("@/context/navigation-context", () => ({
  useNavigation: () => ({
    activeSection: "/",
    isScrolled: false,
    scrollToSection: vi.fn(),
  }),
}));

import Navbar from "../nav-bar";

describe("Navbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSession.mockReturnValue({ data: null });
  });

  it("renders section links with hash-based hrefs", () => {
    render(<Navbar />);

    expect(screen.getByRole("link", { name: /about/i })).toHaveAttribute(
      "href",
      "/#about"
    );
    expect(screen.getByRole("link", { name: /skills/i })).toHaveAttribute(
      "href",
      "/#skills"
    );
    expect(screen.getByRole("link", { name: /projects/i })).toHaveAttribute(
      "href",
      "/#projects"
    );
  });

  it("shows Sign Out button when session is active", () => {
    mockUseSession.mockReturnValue({
      data: { user: { email: "user@example.com" } },
    });

    render(<Navbar />);

    expect(
      screen.getByRole("button", { name: /sign out/i })
    ).toBeInTheDocument();
  });

  it("hides Sign Out button when no session is active", () => {
    mockUseSession.mockReturnValue({ data: null });

    render(<Navbar />);

    expect(
      screen.queryByRole("button", { name: /sign out/i })
    ).not.toBeInTheDocument();
  });
});
