import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));

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

// Mock Sheet so content is always rendered (no portal/dialog behaviour in tests)
vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SheetContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SheetHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SheetTitle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SheetDescription: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const { mockUseSession } = vi.hoisted(() => ({
  mockUseSession: vi.fn(),
}));

vi.mock("@/lib/auth/auth-client", () => ({
  authClient: {
    useSession: mockUseSession,
  },
}));

vi.mock("@/context/navigation-context", () => ({
  useNavigation: () => ({
    activeSection: "/",
    isScrolled: false,
    scrollToSection: vi.fn(),
  }),
}));

import { MobileMenu } from "../mobile-menu";

describe("MobileMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSession.mockReturnValue({ data: null });
  });

  it("renders My Portal with an icon when session is present", () => {
    mockUseSession.mockReturnValue({
      data: { user: { email: "user@example.com", role: "user" } },
    });

    render(<MobileMenu isScrolled={false} />);

    expect(screen.getByText("My Portal")).toBeInTheDocument();
    const portalLink = screen.getByRole("link", { name: /my portal/i });
    expect(portalLink.querySelector("svg")).toBeInTheDocument();
  });

  it("does not render My Portal when no session", () => {
    render(<MobileMenu isScrolled={false} />);

    expect(screen.queryByText("My Portal")).not.toBeInTheDocument();
  });
});
