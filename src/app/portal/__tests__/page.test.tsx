import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const { mockRedirect, mockGetSession, mockGetSubmissions } = vi.hoisted(() => ({
  mockRedirect: vi.fn(),
  mockGetSession: vi.fn(),
  mockGetSubmissions: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));

vi.mock("next/headers", () => ({
  headers: () => new Headers(),
}));

vi.mock("@/lib/auth/auth", () => ({
  auth: {
    api: {
      getSession: mockGetSession,
    },
  },
}));

vi.mock("@/lib/dal", () => ({
  getSubmissionsByUserId: mockGetSubmissions,
}));

import PortalPage from "../page";

describe("PortalPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSubmissions.mockResolvedValue([]);
  });

  describe("auth guard", () => {
    it("redirects to / when there is no session", async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(PortalPage()).rejects.toThrow("NEXT_REDIRECT:/");
      expect(mockRedirect).toHaveBeenCalledWith("/");
    });

    it("redirects to / when session has no user", async () => {
      mockGetSession.mockResolvedValue({ session: {}, user: null });

      await expect(PortalPage()).rejects.toThrow("NEXT_REDIRECT:/");
      expect(mockRedirect).toHaveBeenCalledWith("/");
    });
  });

  describe("authenticated view", () => {
    const session = {
      session: { id: "sess-1", userId: "user-abc" },
      user: { id: "user-abc", email: "alice@example.com", name: "Alice" },
    };

    it("renders a heading for the portal page", async () => {
      mockGetSession.mockResolvedValue(session);
      mockGetSubmissions.mockResolvedValue([]);

      render(await PortalPage());

      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("queries submissions only for the authenticated user's userId", async () => {
      mockGetSession.mockResolvedValue(session);
      mockGetSubmissions.mockResolvedValue([]);

      render(await PortalPage());

      expect(mockGetSubmissions).toHaveBeenCalledWith("user-abc");
      expect(mockGetSubmissions).toHaveBeenCalledTimes(1);
    });

    it("displays a message when the user has no submissions", async () => {
      mockGetSession.mockResolvedValue(session);
      mockGetSubmissions.mockResolvedValue([]);

      render(await PortalPage());

      expect(document.body.textContent?.toLowerCase()).toMatch(/no submissions|no inquiries/);
    });

    it("displays each submission's description", async () => {
      mockGetSession.mockResolvedValue(session);
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
      mockGetSession.mockResolvedValue(session);
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
      mockGetSession.mockResolvedValue(session);

      render(await PortalPage());

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading.className).toMatch(/font-playfair|--font-playfair/);
    });
  });
});
