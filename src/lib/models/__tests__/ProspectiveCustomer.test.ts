import { vi, describe, it, expect } from "vitest";

vi.mock("mongoose", () => {
  const capturedArgs: unknown[] = [];
  const ObjectId = Symbol("ObjectId");
  const schemaCtor = vi.fn(function (this: Record<string, unknown>, definition: unknown, options: unknown) {
    this.definition = definition;
    this.options = options;
    capturedArgs.push({ definition, options });
  });
  (schemaCtor as unknown as { _capturedArgs: unknown[]; Types: { ObjectId: symbol } }).Types = { ObjectId };
  (schemaCtor as unknown as { _capturedArgs: unknown[] })._capturedArgs = capturedArgs;
  return {
    default: {
      models: {},
      model: vi.fn(() => ({})),
      Schema: schemaCtor,
    },
    Schema: schemaCtor,
  };
});

import mongoose from "mongoose";

const getSchemaDefinition = async () => {
  const mod = await import("@/lib/models/ProspectiveCustomer");
  return mod;
};

describe("ProspectiveCustomer model schema", () => {
  it("mongoose.model is called with a schema containing userId", async () => {
    await getSchemaDefinition();
    const modelFn = mongoose.model as ReturnType<typeof vi.fn>;
    expect(modelFn).toHaveBeenCalled();
    const [, schemaInstance] = modelFn.mock.calls[0];
    const definition = (schemaInstance as { definition: Record<string, unknown> })?.definition;
    expect(definition).toHaveProperty("userId");
  });

  it("userId field is required", async () => {
    const modelFn = mongoose.model as ReturnType<typeof vi.fn>;
    const [, schemaInstance] = modelFn.mock.calls[0];
    const definition = (schemaInstance as { definition: Record<string, { required?: unknown }> })?.definition;
    expect(definition?.userId?.required).toBeTruthy();
  });

  it("schema has a parentId field", async () => {
    const modelFn = mongoose.model as ReturnType<typeof vi.fn>;
    const [, schemaInstance] = modelFn.mock.calls[0];
    const definition = (schemaInstance as { definition: Record<string, unknown> })?.definition;
    expect(definition).toHaveProperty("parentId");
  });

  it("parentId field is optional (no required constraint)", async () => {
    const modelFn = mongoose.model as ReturnType<typeof vi.fn>;
    const [, schemaInstance] = modelFn.mock.calls[0];
    const definition = (schemaInstance as { definition: Record<string, { required?: unknown }> })?.definition;
    expect(definition?.parentId?.required).toBeFalsy();
  });

  it("schema does not have firstName, lastName, or email fields", async () => {
    const modelFn = mongoose.model as ReturnType<typeof vi.fn>;
    const [, schemaInstance] = modelFn.mock.calls[0];
    const definition = (schemaInstance as { definition: Record<string, unknown> })?.definition;
    expect(definition).not.toHaveProperty("firstName");
    expect(definition).not.toHaveProperty("lastName");
    expect(definition).not.toHaveProperty("email");
  });
});
