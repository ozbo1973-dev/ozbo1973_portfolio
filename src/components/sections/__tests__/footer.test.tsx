import { render } from "@testing-library/react";
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

import Footer from "../footer";

describe("Footer", () => {
  it("uses bg-card token instead of hardcoded bg-slate-800", () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector("footer");
    expect(footer?.className).toContain("bg-card");
    expect(footer?.className).not.toContain("bg-slate-800");
  });

  it("has a border-t separator", () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector("footer");
    expect(footer?.className).toContain("border-t");
  });
});
