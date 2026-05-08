import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const { mockVerifySession, mockGetSubmissions } = vi.hoisted(() => ({
  mockVerifySession: vi.fn(),
  mockGetSubmissions: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));

vi.mock("@/lib/dal/prospects", () => ({
  verifySession: mockVerifySession,
  getSubmissionsByUserId: mockGetSubmissions,
}));

import PortalPage from "../page";

describe("PortalPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifySession.mockResolvedValue({ userId: "user-abc", email: "alice@example.com" });
    mockGetSubmissions.mockResolvedValue([]);
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

    it("calls getSubmissionsByUserId with zero arguments", async () => {
      render(await PortalPage());

      expect(mockGetSubmissions).toHaveBeenCalledWith();
      expect(mockGetSubmissions).toHaveBeenCalledTimes(1);
    });

    it("displays a message when the user has no submissions", async () => {
      render(await PortalPage());

      expect(document.body.textContent?.toLowerCase()).toMatch(/no submissions|no inquiries/);
    });

    it("displays each submission's description", async () => {
      mockGetSubmissions.mockResolvedValue([
        {
          id: "sub-1",
          firstName: "Alice",
          lastName: "Smith",
          email: "alice@example.com",
          description: "Build me a portfolio site",
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-02"),
        },
        {
          id: "sub-2",
          firstName: "Alice",
          lastName: "Smith",
          email: "alice@example.com",
          description: "E-commerce store",
          createdAt: new Date("2024-02-01"),
          updatedAt: new Date("2024-02-02"),
        },
      ]);

      render(await PortalPage());

      expect(screen.getByText("Build me a portfolio site")).toBeInTheDocument();
      expect(screen.getByText("E-commerce store")).toBeInTheDocument();
    });

    it("renders no editable form elements — submissions are read-only", async () => {
      mockGetSubmissions.mockResolvedValue([
        {
          id: "sub-1",
          firstName: "Alice",
          lastName: "Smith",
          email: "alice@example.com",
          description: "Some project",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      render(await PortalPage());

      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /submit|save|edit/i })).not.toBeInTheDocument();
    });

    it("heading uses Playfair Display font class to match site design", async () => {
      render(await PortalPage());

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading.className).toMatch(/font-playfair|--font-playfair/);
    });
  });
});
