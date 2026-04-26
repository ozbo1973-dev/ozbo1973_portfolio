import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SectionHeader from "../header";

describe("SectionHeader", () => {
  it("renders the full title text without splitting first letters", () => {
    render(<SectionHeader>About Me</SectionHeader>);
    // The full text should be accessible as a heading
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "About Me"
    );
  });

  it("renders title in primary (amber) color class", () => {
    render(<SectionHeader>Skills</SectionHeader>);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveClass("text-primary");
  });

  it("renders an amber underline bar instead of a full-width border", () => {
    const { container } = render(<SectionHeader>Projects</SectionHeader>);
    // Should have a short fixed-width underline bar
    const underlineBar = container.querySelector(".bg-primary.w-16");
    expect(underlineBar).toBeInTheDocument();
    // Should NOT have a full-width bottom border
    const fullWidthBorder = container.querySelector(
      "[class*='border-b-4'][class*='border-slate-800']"
    );
    expect(fullWidthBorder).not.toBeInTheDocument();
  });

  it("applies Playfair Display font variable to the heading", () => {
    render(<SectionHeader>Contact</SectionHeader>);
    const heading = screen.getByRole("heading", { level: 2 });
    // The heading should use the playfair font CSS variable
    expect(heading.className).toMatch(/font-playfair|--font-playfair/);
  });
});
