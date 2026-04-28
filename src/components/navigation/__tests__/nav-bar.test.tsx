import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => (
    <img {...props} alt={props.alt as string} />
  ),
}));

vi.mock("@/context/navigation-context", () => ({
  useNavigation: () => ({
    activeSection: "/",
    isScrolled: false,
    scrollToSection: vi.fn(),
  }),
}));

vi.mock("@/lib/config", () => ({
  navLinks: [
    { href: "/about", label: "About" },
    { href: "/skills", label: "Skills" },
  ],
}));

vi.mock("../mobile-menu", () => ({
  MobileMenu: () => <div data-testid="mobile-menu" />,
}));

vi.mock("../contact-button", () => ({
  ContactButton: () => <div data-testid="contact-button" />,
}));

import Navbar from "../nav-bar";

describe("Navbar", () => {
  it("uses bg-card token instead of hardcoded bg-slate-800", () => {
    const { container } = render(<Navbar />);
    const nav = container.querySelector("nav");
    expect(nav?.className).toContain("bg-card");
    expect(nav?.className).not.toContain("bg-slate-800");
  });

  it("retains border-b separator", () => {
    const { container } = render(<Navbar />);
    const nav = container.querySelector("nav");
    expect(nav?.className).toContain("border-b");
  });
});
