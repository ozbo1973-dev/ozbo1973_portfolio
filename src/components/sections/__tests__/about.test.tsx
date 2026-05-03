import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("@/components/sections/wrapper", () => ({
  default: ({
    children,
    id,
  }: {
    children: React.ReactNode;
    id?: string;
  }) => <div data-section-id={id}>{children}</div>,
}));

vi.mock("@/components/sections/main-button", () => ({
  SectionMainButton: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

import AboutSection from "../about";
import { SECTION_IDS } from "@/lib/config";

describe("AboutSection", () => {
  it("passes the 'about' section ID from config to SectionWrapper", () => {
    const { container } = render(<AboutSection />);
    const wrapper = container.querySelector("[data-section-id]");
    expect(wrapper).not.toBeNull();
    expect(wrapper!.getAttribute("data-section-id")).toBe(SECTION_IDS[1]);
  });

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
