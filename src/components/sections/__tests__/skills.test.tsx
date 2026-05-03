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

vi.mock("@icons-pack/react-simple-icons", () => ({
  SiReact: () => <svg data-testid="icon-react" />,
  SiNextdotjs: () => <svg data-testid="icon-nextdotjs" />,
  SiTypescript: () => <svg data-testid="icon-typescript" />,
  SiNodedotjs: () => <svg data-testid="icon-nodedotjs" />,
}));

import SkillsSection from "../skills";
import { SECTION_IDS } from "@/lib/config";

describe("SkillsSection", () => {
  it("passes the 'skills' section ID from config to SectionWrapper", () => {
    const { container } = render(<SkillsSection />);
    const wrapper = container.querySelector("[data-section-id]");
    expect(wrapper).not.toBeNull();
    expect(wrapper!.getAttribute("data-section-id")).toBe(SECTION_IDS[2]);
  });

  it("renders all four technology icons", () => {
    render(<SkillsSection />);
    expect(screen.getByTestId("icon-react")).toBeInTheDocument();
    expect(screen.getByTestId("icon-nextdotjs")).toBeInTheDocument();
    expect(screen.getByTestId("icon-typescript")).toBeInTheDocument();
    expect(screen.getByTestId("icon-nodedotjs")).toBeInTheDocument();
  });

  it("each skill card has amber top border accent class", () => {
    const { container } = render(<SkillsSection />);
    const cards = container.querySelectorAll("[class*='border-t-2']");
    expect(cards.length).toBe(4);
    cards.forEach((card) => {
      expect(card.className).toMatch(/border-primary/);
    });
  });

  it("progress bars use slim height and amber fill", () => {
    const { container } = render(<SkillsSection />);
    // The filled portion of progress bars should have amber fill and slim height
    const progressFills = container.querySelectorAll("[class*='bg-primary']");
    // At least 4 fills (one per skill card) — may have more due to card borders
    expect(progressFills.length).toBeGreaterThanOrEqual(4);
    // Progress fill bars should not use tall h-5 class
    const tallProgressBars = container.querySelectorAll(
      "[style*='width'] .h-5"
    );
    expect(tallProgressBars.length).toBe(0);
  });

  it("skill cards have staggered animation-delay inline styles", () => {
    const { container } = render(<SkillsSection />);
    // Each card should have an inline animation-delay style
    const cards = container.querySelectorAll("[style*='animation-delay']");
    expect(cards.length).toBe(4);
  });
});
