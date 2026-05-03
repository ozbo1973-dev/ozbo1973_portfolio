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

vi.mock("@/app/actions/submitContactForm", () => ({
  submitContactForm: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

import ContactSection from "../contact";
import { SECTION_IDS } from "@/lib/config";

describe("ContactSection — section ID", () => {
  it("passes the 'contact' section ID from config to SectionWrapper", () => {
    const { container } = render(<ContactSection />);
    const wrapper = container.querySelector("[data-section-id]");
    expect(wrapper).not.toBeNull();
    expect(wrapper!.getAttribute("data-section-id")).toBe(SECTION_IDS[4]);
  });
});

describe("ContactSection — form fields", () => {
  it("renders all required form fields", () => {
    render(<ContactSection />);
    expect(screen.getByPlaceholderText("First Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Last Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        "Question or brief description of project in mind"
      )
    ).toBeInTheDocument();
  });
});

