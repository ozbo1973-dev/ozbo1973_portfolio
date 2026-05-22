import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const { mockDeleteSubmissionAction } = vi.hoisted(() => ({
  mockDeleteSubmissionAction: vi.fn(),
}));

vi.mock("@/app/actions/deleteSubmission", () => ({
  deleteSubmissionAction: mockDeleteSubmissionAction,
}));

const { mockDeleteAccountAction } = vi.hoisted(() => ({
  mockDeleteAccountAction: vi.fn(),
}));

vi.mock("@/app/actions/deleteAccount", () => ({
  deleteAccountAction: mockDeleteAccountAction,
}));

const { mockSubmitPortalRequest } = vi.hoisted(() => ({
  mockSubmitPortalRequest: vi.fn(),
}));

vi.mock("@/app/actions/submitPortalRequest", () => ({
  submitPortalRequest: mockSubmitPortalRequest,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/auth/auth-client", () => ({
  authClient: { signOut: vi.fn() },
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
  useRouter: () => ({ push: vi.fn() }),
}));

const { mockVerifySession, mockGetThreadsByUserId } = vi.hoisted(() => ({
  mockVerifySession: vi.fn(),
  mockGetThreadsByUserId: vi.fn(),
}));

vi.mock("@/lib/dal/prospects", () => ({
  verifySession: mockVerifySession,
  getThreadsByUserId: mockGetThreadsByUserId,
}));

import PortalPage from "../page";

const makeThread = (id: string, description: string, date: Date) => ({
  root: {
    id,
    userId: "user-abc",
    description,
    createdAt: date,
  },
  replies: [],
  latestActivity: date,
});

describe("PortalPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifySession.mockResolvedValue({ userId: "user-abc", email: "alice@example.com", name: "Alice Smith" });
    mockGetThreadsByUserId.mockResolvedValue([]);
  });

  describe("auth guard", () => {
    it("redirects to / when verifySession throws a redirect", async () => {
      mockVerifySession.mockImplementation(() => {
        throw new Error("NEXT_REDIRECT:/");
      });

      await expect(PortalPage()).rejects.toThrow("NEXT_REDIRECT:/");
    });
  });

  describe("authenticated view", () => {
    it("renders a heading for the portal page", async () => {
      render(await PortalPage());

      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("calls getThreadsByUserId with the current user id", async () => {
      render(await PortalPage());

      expect(mockGetThreadsByUserId).toHaveBeenCalledWith("user-abc");
      expect(mockGetThreadsByUserId).toHaveBeenCalledTimes(1);
    });

    it("displays a message when the user has no submissions", async () => {
      render(await PortalPage());

      expect(document.body.textContent?.toLowerCase()).toMatch(/no submissions|no inquiries/);
    });

    it("displays each thread root description", async () => {
      mockGetThreadsByUserId.mockResolvedValue([
        makeThread("sub-1", "Build me a portfolio site", new Date("2024-01-01")),
        makeThread("sub-2", "E-commerce store", new Date("2024-02-01")),
      ]);

      render(await PortalPage());

      expect(screen.getByText("Build me a portfolio site")).toBeInTheDocument();
      expect(screen.getByText("E-commerce store")).toBeInTheDocument();
    });

    it("renders a New Request form accessible within the portal", async () => {
      render(await PortalPage());

      expect(screen.getByRole("textbox", { name: /description/i })).toBeInTheDocument();
    });

    it("renders a submit button for the new request form", async () => {
      render(await PortalPage());

      expect(screen.getByRole("button", { name: /submit request/i })).toBeInTheDocument();
    });

    it("heading uses Playfair Display font class to match site design", async () => {
      render(await PortalPage());

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading.className).toMatch(/font-playfair|--font-playfair/);
    });

    it("renders a delete button for each thread", async () => {
      mockGetThreadsByUserId.mockResolvedValue([
        makeThread("sub-1", "First project", new Date("2024-01-01")),
        makeThread("sub-2", "Second project", new Date("2024-02-01")),
      ]);

      render(await PortalPage());

      const deleteButtons = screen.getAllByRole("button", { name: /delete submission/i });
      expect(deleteButtons).toHaveLength(2);
    });

    it("renders a delete account button", async () => {
      render(await PortalPage());

      expect(screen.getByRole("button", { name: /delete account/i })).toBeInTheDocument();
    });

    it("displays the signed-in user's email below the subtitle", async () => {
      render(await PortalPage());

      expect(screen.getByText(/signed in as:\s*alice@example\.com/i)).toBeInTheDocument();
    });
  });
});
