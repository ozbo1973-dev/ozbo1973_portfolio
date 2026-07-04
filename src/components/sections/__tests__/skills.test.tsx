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
  SiJavascript: () => <svg data-testid="icon-javascript" />,
  SiHtml5: () => <svg data-testid="icon-html5" />,
  SiCss: () => <svg data-testid="icon-css" />,
  SiDocker: () => <svg data-testid="icon-docker" />,
  SiClaude: () => <svg data-testid="icon-claude" />,
}));

vi.mock("lucide-react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("lucide-react")>();
  return {
    ...actual,
    Bot: () => <svg data-testid="icon-bot" />,
    BrainCircuit: () => <svg data-testid="icon-brain-circuit" />,
  };
});

import SkillsSection from "../skills";
import { SECTION_IDS } from "@/lib/config";

const EXPECTED_SKILLS = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "HTML",
  "CSS",
  "Node.js",
  "Docker",
  "Claude Code",
  "AI Agents",
  "AI Engineer",
];

const EXPECTED_ICONS = [
  "icon-react",
  "icon-nextdotjs",
  "icon-typescript",
  "icon-javascript",
  "icon-html5",
  "icon-css",
  "icon-nodedotjs",
  "icon-docker",
  "icon-claude",
  "icon-bot",
  "icon-brain-circuit",
];

describe("SkillsSection", () => {
  it("passes the 'skills' section ID from config to SectionWrapper", () => {
    const { container } = render(<SkillsSection />);
    const wrapper = container.querySelector("[data-section-id]");
    expect(wrapper).not.toBeNull();
    expect(wrapper!.getAttribute("data-section-id")).toBe(SECTION_IDS[2]);
  });

  it("renders all eleven skill names", () => {
    render(<SkillsSection />);
    for (const name of EXPECTED_SKILLS) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it("renders all eleven technology icons", () => {
    render(<SkillsSection />);
    for (const testId of EXPECTED_ICONS) {
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    }
  });

  it("each skill card has primary top border accent class", () => {
    const { container } = render(<SkillsSection />);
    const cards = container.querySelectorAll("[class*='border-t-2']");
    expect(cards.length).toBe(11);
    cards.forEach((card) => {
      expect(card.className).toMatch(/border-primary/);
    });
  });

  it("skill cards have staggered animation-delay inline styles", () => {
    const { container } = render(<SkillsSection />);
    const cards = container.querySelectorAll("[style*='animation-delay']");
    expect(cards.length).toBe(11);
  });

  it("renders the Download Resume action", () => {
    render(<SkillsSection />);
    expect(screen.getByText(/download resume/i)).toBeInTheDocument();
  });

  it("progress bars use primary fill", () => {
    const { container } = render(<SkillsSection />);
    const progressFills = container.querySelectorAll("[class*='bg-primary']");
    expect(progressFills.length).toBeGreaterThanOrEqual(11);
  });
});
