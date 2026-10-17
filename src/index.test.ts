import validator, { ValidationErrors } from "./";
import { JSONSchema } from "@json-schema-tools/meta-schema";
import { ObjectValidationError } from "./base-validators/object";
import { NumberValidationError } from "./base-validators/number";
import { StringValidationError } from "./base-validators/string";
import { OneOfValidationError } from "./base-validators/oneOf";

describe("validator", () => {
  it("is a function", () => {
    expect(typeof validator).toBe("function");
  });

  it("can handle mixed schema", () => {
    const testSchema = {
      type: "object",
      properties: {
        foo: { type: "string", enum: ["abc", "xyz"] },
        bar: {
          type: "array",
          items: { type: "number" },
        },
      },
    } as JSONSchema;

    const result = validator(testSchema, {
      foo: "abc",
      bar: [123],
    });

    expect(result).toBe(true);
  });

  it("returns one error when the data has one error in it", () => {
    const testSchema = {
      type: "object",
      properties: {
        foo: { type: "string", enum: ["abc", "xyz"] },
        bar: {
          type: "array",
          items: { type: "number" },
        },
      },
    } as JSONSchema;

    const result = validator(testSchema, {
      foo: "wrong",
      bar: [123],
    });

    expect(result).toBeInstanceOf(ValidationErrors);
    expect((result as ValidationErrors).errors.length).toBe(1);
  });

  it("returns as many errors as there are issues with the data", () => {
    const testSchema = {
      type: "object",
      properties: {
        foo: { type: "string", enum: ["abc", "xyz"] },
        bar: {
          type: "array",
          items: { type: "number" },
        },
      },
    } as JSONSchema;

    const result = validator(testSchema, {
      foo: "wrong",
      bar: ["alsoWrong"],
    });

    expect(result).toBeInstanceOf(ValidationErrors);
    expect((result as ValidationErrors).errors.length).toBe(2);
  });

  it("errors when missing a required property", () => {
    const testSchema = {
      type: "object",
      required: ["foo"],
      properties: {
        foo: { type: "string" },
        bar: true,
      },
    } as JSONSchema;

    const result = validator(testSchema, {
      bar: "anything",
    });

    expect(result).toBeInstanceOf(ValidationErrors);
    expect((result as ValidationErrors).errors.length).toBe(1);
  });

  it("doesnt error when missing optional properties", () => {
    const testSchema = {
      type: "object",
      properties: {
        foo: { type: "string" },
        bar: true,
      },
    } as JSONSchema;

    const result = validator(testSchema, {
      bar: "anything",
    });

    expect(result).toBe(true);
  });

  it("no errors with valid mixed required and optional properties", () => {
    const testSchema = {
      type: "object",
      required: ["foo"],
      properties: {
        foo: { type: "string" },
        bar: true,
        baz: { type: "number" },
      },
    } as JSONSchema;

    const result = validator(testSchema, {
      bar: "anything",
      foo: "anyString",
    });

    expect(result).toBe(true);

    const result1 = validator(testSchema, {
      bar: "anything",
      foo: "anyString",
      baz: 123,
    });

    expect(result1).toBe(true);
  });

  it("gives the right errors when using mixed required and optional properties", () => {
    const testSchema = {
      type: "object",
      required: ["foo"],
      properties: {
        foo: { type: "string" },
        bar: true,
        baz: { type: "number" },
      },
    } as JSONSchema;

    const result = validator(testSchema, {
      baz: "abc",
    }) as any;

    expect(result).toBeInstanceOf(ValidationErrors);
    expect(result.errors[0]).toBeInstanceOf(NumberValidationError);
    expect(result.errors[1]).toBeInstanceOf(ObjectValidationError);
  });
  describe("handles paths correctly when passed simple types", () => {
    it("handles paths correctly when passed a boolean", () => {
      const testSchema = {
        type: "boolean",
      } as JSONSchema;

      const result = validator(testSchema, true) as any;

      expect(result).toBe(true);
    });

    it("handles paths correctly when passed a string", () => {
      const testSchema = {
        type: "string",
      } as JSONSchema;

      const result = validator(testSchema, "potato") as any;

      expect(result).toBe(true);
    });
    it("handles paths correctly when passed a number", () => {
      const testSchema = {
        type: "number",
      } as JSONSchema;

      const result = validator(testSchema, 1) as any;

      expect(result).toBe(true);
    });
  });

  describe("oneOf", () => {
    it("validates when data matches exactly one branch", () => {
      expect(validator({ oneOf: [{ type: "string" }, { type: "number" }] } as any, "potato")).toBe(true);
    });

    it("validates when data matches exactly one branch including null", () => {
      expect(validator({ oneOf: [{ type: "string" }, { type: "null" }] } as any, null)).toBe(true);
    });

    it("errors when data matches more than one branch", () => {
      const result = validator({ oneOf: [{ type: "string" }, {}] } as any, "potato") as any;

      expect(result).toBeInstanceOf(ValidationErrors);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0]).toBeInstanceOf(OneOfValidationError);
      expect(result.errors[0].message).toContain("but 2 matched");
    });

    it("errors when data matches no branches", () => {
      const result = validator({ oneOf: [{ type: "string" }, { type: "number" }] } as any, true) as any;

      expect(result).toBeInstanceOf(ValidationErrors);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0]).toBeInstanceOf(OneOfValidationError);
      expect(result.errors[0].message).toContain("but 0 matched");
    });

    it("supports oneOf nested inside an object property", () => {
      const testSchema = {
        type: "object",
        properties: {
          foo: { oneOf: [{ type: "string" }, { type: "number" }] },
        },
      } as JSONSchema;

      expect(validator(testSchema, { foo: "potato" })).toBe(true);

      const result = validator(testSchema, { foo: true }) as any;
      expect(result).toBeInstanceOf(ValidationErrors);
      expect(result.errors[0]).toBeInstanceOf(OneOfValidationError);
    });

    it("supports oneOf nested inside a oneOf branch", () => {
      const testSchema = {
        oneOf: [
          { oneOf: [{ type: "string" }, { type: "integer" }] },
          { type: "array" },
        ],
      } as JSONSchema;

      expect(validator(testSchema, "potato")).toBe(true);
      expect(validator(testSchema, [1, 2])).toBe(true);

      const result = validator(testSchema, 1.5) as any;
      expect(result).toBeInstanceOf(ValidationErrors);
      expect(result.errors[0]).toBeInstanceOf(OneOfValidationError);
    });

    it("still validates a data property literally named oneOf", () => {
      const testSchema = {
        oneOf: [{ type: "string" }, { type: "number" }],
        properties: {
          oneOf: { type: "string" },
        },
      } as JSONSchema;

      // the real oneOf is satisfied and the property named "oneOf" is a string
      expect(validator(testSchema, "potato")).toBe(true);

      // the property literally named "oneOf" is validated (not skipped as a branch)
      const result = validator(testSchema, true) as any;
      expect(result).toBeInstanceOf(ValidationErrors);
      expect(result.errors.length).toBe(2);
      expect(result.errors[0]).toBeInstanceOf(StringValidationError);
      expect(result.errors[1]).toBeInstanceOf(OneOfValidationError);
    });
  });
});
