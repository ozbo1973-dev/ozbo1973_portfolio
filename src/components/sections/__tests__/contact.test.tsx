import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

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

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

import ContactSection from "../contact";
import { SECTION_IDS } from "@/lib/config";
import { submitContactForm } from "@/app/actions/submitContactForm";
import { toast } from "sonner";

const mockSubmitContactForm = submitContactForm as ReturnType<typeof vi.fn>;

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

describe("ContactSection — magic link notice", () => {
  it("renders the magic link account notice between textarea and submit button", () => {
    render(<ContactSection />);
    expect(
      screen.getByText(
        "Submitting creates an account. You'll sign in via a magic link — no password needed."
      )
    ).toBeInTheDocument();
  });
});

describe("ContactSection — submit button disabled state", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("is disabled on initial render when all fields are empty", () => {
    render(<ContactSection />);
    const button = screen.getByRole("button", { name: /submit/i });
    expect(button).toBeDisabled();
  });

  it("remains disabled when only some fields are filled", () => {
    render(<ContactSection />);
    fireEvent.change(screen.getByPlaceholderText("First Name"), { target: { value: "Jane" } });
    fireEvent.change(screen.getByPlaceholderText("Last Name"), { target: { value: "Doe" } });
    const button = screen.getByRole("button", { name: /submit/i });
    expect(button).toBeDisabled();
  });

  it("remains disabled when a field contains only whitespace", () => {
    render(<ContactSection />);
    fireEvent.change(screen.getByPlaceholderText("First Name"), { target: { value: "   " } });
    fireEvent.change(screen.getByPlaceholderText("Last Name"), { target: { value: "Doe" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "jane@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Question or brief description of project in mind"), {
      target: { value: "Some project" },
    });
    const button = screen.getByRole("button", { name: /submit/i });
    expect(button).toBeDisabled();
  });

  it("becomes enabled when all four required fields have non-whitespace content", () => {
    render(<ContactSection />);
    fireEvent.change(screen.getByPlaceholderText("First Name"), { target: { value: "Jane" } });
    fireEvent.change(screen.getByPlaceholderText("Last Name"), { target: { value: "Doe" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "jane@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Question or brief description of project in mind"), {
      target: { value: "Some project" },
    });
    const button = screen.getByRole("button", { name: /submit/i });
    expect(button).not.toBeDisabled();
  });

  it("honeypot field does not affect enabled/disabled logic", () => {
    render(<ContactSection />);
    fireEvent.change(screen.getByPlaceholderText("First Name"), { target: { value: "Jane" } });
    fireEvent.change(screen.getByPlaceholderText("Last Name"), { target: { value: "Doe" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "jane@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Question or brief description of project in mind"), {
      target: { value: "Some project" },
    });
    const button = screen.getByRole("button", { name: /submit/i });
    expect(button).not.toBeDisabled();
  });
});

describe("ContactSection — form submission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("navigates to /verify-email on successful submission", async () => {
    mockSubmitContactForm.mockResolvedValue({ success: true, redirect: "/verify-email" });
    render(<ContactSection />);

    fireEvent.change(screen.getByPlaceholderText("First Name"), { target: { value: "Jane" } });
    fireEvent.change(screen.getByPlaceholderText("Last Name"), { target: { value: "Doe" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "jane@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Question or brief description of project in mind"), {
      target: { value: "Help me build something" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /submit/i }).closest("form")!);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/verify-email");
    });
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("shows error toast on failed submission", async () => {
    mockSubmitContactForm.mockResolvedValue({ success: false, error: "Something went wrong" });
    render(<ContactSection />);

    fireEvent.submit(screen.getByRole("button", { name: /submit/i }).closest("form")!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
    });
    expect(mockPush).not.toHaveBeenCalled();
  });
});
