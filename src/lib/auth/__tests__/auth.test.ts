import { vi, describe, it, expect } from "vitest";

// Mock better-auth and its MongoDB adapter so the test doesn't need a live DB
vi.mock("better-auth", () => ({
  betterAuth: vi.fn(() => ({
    handler: vi.fn(),
    api: {},
    options: {},
  })),
}));

vi.mock("@better-auth/mongo-adapter", () => ({
  mongodbAdapter: vi.fn(() => ({ type: "mongodb" })),
}));

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: vi.fn() },
  })),
}));

import { auth } from "@/lib/auth/auth";

describe("auth instance", () => {
  it("exports an auth object with a handler function", () => {
    expect(auth).toBeDefined();
    expect(typeof auth.handler).toBe("function");
  });

  it("exports an auth object with an api property", () => {
    expect(auth).toHaveProperty("api");
  });
});
