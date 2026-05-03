import { render } from "@testing-library/react";
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

import ProjectsSection from "../projects";
import { SECTION_IDS } from "@/lib/config";

describe("ProjectsSection", () => {
  it("passes the 'projects' section ID from config to SectionWrapper", () => {
    const { container } = render(<ProjectsSection />);
    const wrapper = container.querySelector("[data-section-id]");
    expect(wrapper).not.toBeNull();
    expect(wrapper!.getAttribute("data-section-id")).toBe(SECTION_IDS[3]);
  });
});
