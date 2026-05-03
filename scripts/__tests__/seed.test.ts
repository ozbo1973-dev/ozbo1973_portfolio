import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock mongodb and mongoose to avoid real DB connections
vi.mock("mongodb", () => ({
  MongoClient: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    close: vi.fn(),
    db: vi.fn(() => ({
      collection: vi.fn(() => ({
        deleteMany: vi.fn(),
        insertOne: vi.fn().mockResolvedValue({ insertedId: "mock-id" }),
        insertMany: vi.fn().mockResolvedValue({ insertedCount: 3 }),
      })),
    })),
  })),
}));

vi.mock("mongoose", () => ({
  default: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    models: {},
    model: vi.fn(() => ({
      deleteMany: vi.fn(),
      create: vi.fn(),
    })),
    Schema: vi.fn(function (this: Record<string, unknown>, definition: unknown) {
      this.definition = definition;
    }),
  },
}));

vi.mock("@/lib/db/connect", () => ({
  default: vi.fn(),
}));

import { buildSeedUsers, buildLinkedProspects } from "@/scripts/seed";

describe("seed data builders", () => {
  it("buildSeedUsers returns 3 users", () => {
    const users = buildSeedUsers();
    expect(users).toHaveLength(3);
  });

  it("first seed user is Brady Bovero with admin role", () => {
    const [brady] = buildSeedUsers();
    expect(brady.name).toBe("Brady Bovero");
    expect(brady.email).toBe("bbbove20@gmail.com");
    expect(brady.role).toBe("admin");
    expect(brady.emailVerified).toBe(true);
  });

  it("second seed user is John Doe with user role", () => {
    const [, john] = buildSeedUsers();
    expect(john.name).toBe("John Doe");
    expect(john.email).toBe("bbbove20+Test1@gmail.com");
    expect(john.role).toBe("user");
    expect(john.emailVerified).toBe(true);
  });

  it("third seed user is Jane Doe with user role", () => {
    const [, , jane] = buildSeedUsers();
    expect(jane.name).toBe("Jane Doe");
    expect(jane.email).toBe("bbbove20+Test2@gmail.com");
    expect(jane.role).toBe("user");
    expect(jane.emailVerified).toBe(true);
  });

  it("buildLinkedProspects creates a ProspectiveCustomer record for each user", () => {
    const users = buildSeedUsers().map((u, i) => ({ ...u, id: `user-${i}` }));
    const prospects = buildLinkedProspects(users);
    expect(prospects).toHaveLength(3);
  });

  it("each prospect has userId referencing its user", () => {
    const users = buildSeedUsers().map((u, i) => ({ ...u, id: `user-${i}` }));
    const prospects = buildLinkedProspects(users);
    prospects.forEach((prospect, i) => {
      expect(prospect.userId).toBe(`user-${i}`);
    });
  });

  it("each prospect has required ProspectiveCustomer fields", () => {
    const users = buildSeedUsers().map((u, i) => ({ ...u, id: `user-${i}` }));
    const prospects = buildLinkedProspects(users);
    prospects.forEach((prospect) => {
      expect(prospect).toHaveProperty("firstName");
      expect(prospect).toHaveProperty("lastName");
      expect(prospect).toHaveProperty("email");
      expect(prospect).toHaveProperty("description");
    });
  });

  it("prospect email matches user email", () => {
    const users = buildSeedUsers().map((u, i) => ({ ...u, id: `user-${i}` }));
    const prospects = buildLinkedProspects(users);
    prospects.forEach((prospect, i) => {
      expect(prospect.email).toBe(users[i].email);
    });
  });
});
