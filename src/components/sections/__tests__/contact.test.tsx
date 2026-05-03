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

describe("ContactSection — single dark card structure", () => {
  it("does not render a bg-slate-800 outer wrapper", () => {
    const { container } = render(<ContactSection />);
    const outerWrapper = container.querySelector(".bg-slate-800");
    expect(outerWrapper).not.toBeInTheDocument();
  });

  it("card has a 3px amber top border accent", () => {
    const { container } = render(<ContactSection />);
    const card = container.querySelector("[class*='border-t-\\[3px\\]']");
    expect(card).toBeInTheDocument();
    expect(card!.className).toMatch(/border-t-primary/);
  });

  it("card has a subtle primary/20 border all around", () => {
    const { container } = render(<ContactSection />);
    const card = container.querySelector(".bg-card");
    expect(card).toBeInTheDocument();
    expect(card!.className).toMatch(/border/);
    expect(card!.className).toMatch(/border-primary\/20/);
  });
});

describe("ContactSection — submit button alignment", () => {
  it("submit button is full-width on mobile (w-full class)", () => {
    render(<ContactSection />);
    const submitBtn = screen.getByRole("button", { name: /submit/i });
    expect(submitBtn.className).toMatch(/w-full/);
  });

  it("submit button container uses justify-end for right alignment", () => {
    const { container } = render(<ContactSection />);
    const btnContainer = container.querySelector(".justify-end");
    expect(btnContainer).toBeInTheDocument();
  });
});
