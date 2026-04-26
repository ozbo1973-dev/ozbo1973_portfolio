import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("@/components/sections/wrapper", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/components/sections/main-button", () => ({
  SectionMainButton: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

import AboutSection from "../about";

describe("AboutSection", () => {
  it("image placeholder has amber dashed border (not raw bg-zinc-200)", () => {
    const { container } = render(<AboutSection />);
    // Should not have the raw grey placeholder
    const greyPlaceholder = container.querySelector(".bg-zinc-200");
    expect(greyPlaceholder).not.toBeInTheDocument();
    // Should have a dashed border element
    const dashedBorder = container.querySelector("[class*='border-dashed']");
    expect(dashedBorder).toBeInTheDocument();
  });

  it("image placeholder contains a UserRound icon", () => {
    render(<AboutSection />);
    // lucide-react icons render as svg; the UserRound should be present
    const icon = document.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("image placeholder has amber border color class", () => {
    const { container } = render(<AboutSection />);
    const amberBorder = container.querySelector(
      "[class*='border-primary'],[class*='border-amber']"
    );
    expect(amberBorder).toBeInTheDocument();
  });

  it("text content block has an amber left-border accent", () => {
    const { container } = render(<AboutSection />);
    const leftBorderAccent = container.querySelector("[class*='border-l']");
    expect(leftBorderAccent).toBeInTheDocument();
    // Should also have a primary/amber color on the border
    expect(leftBorderAccent!.className).toMatch(/border-primary|border-amber/);
  });
});
