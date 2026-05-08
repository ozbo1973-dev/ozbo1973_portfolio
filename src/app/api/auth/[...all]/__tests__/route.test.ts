import { vi, describe, it, expect } from "vitest";

vi.mock("@/lib/auth/auth", () => ({
  auth: {
    handler: vi.fn(async (_req: Request) => new Response("ok")),
    api: {},
    options: {},
  },
}));

vi.mock("better-auth/next-js", () => ({
  toNextJsHandler: vi.fn((auth: { handler: unknown }) => ({
    GET: auth.handler,
    POST: auth.handler,
  })),
}));

import { GET, POST } from "@/app/api/auth/[...all]/route";

describe("BetterAuth route handler", () => {
  it("exports a GET handler", () => {
    expect(typeof GET).toBe("function");
  });

  it("exports a POST handler", () => {
    expect(typeof POST).toBe("function");
  });
});
