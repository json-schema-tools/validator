import validator from "./";
import { JSONSchema } from "@json-schema-tools/meta-schema";
import { ObjectValidationError } from "./base-validators/object";
import { NumberValidationError } from "./base-validators/number";
import { ValidationErrors } from "./validation-error";

describe("validator", () => {
  it("is a function", () => { expect(typeof validator).toBe("function"); });

  it("can handle mixed schema", () => {
    const testSchema = {
      type: "object",
      properties: {
        foo: { type: "string", enum: ["abc", "xyz"] },
        bar: {
          type: "array",
          items: { type: "number" }
        }
      }
    } as JSONSchema;

    const result = validator(testSchema, {
      foo: "abc",
      bar: [123]
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
          items: { type: "number" }
        }
      }
    } as JSONSchema;

    const result = validator(testSchema, {
      foo: "wrong",
      bar: [123]
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
          items: { type: "number" }
        }
      }
    } as JSONSchema;

    const result = validator(testSchema, {
      foo: "wrong",
      bar: ["alsoWrong"]
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
        bar: true
      }
    } as JSONSchema;

    const result = validator(testSchema, {
      bar: "anything"
    });

    expect(result).toBeInstanceOf(ValidationErrors);
    expect((result as ValidationErrors).errors.length).toBe(1);
  });

  it("doesnt error when missing optional properties", () => {
    const testSchema = {
      type: "object",
      properties: {
        foo: { type: "string" },
        bar: true
      }
    } as JSONSchema;

    const result = validator(testSchema, {
      bar: "anything"
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
        baz: { type: "number" }
      }
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
        baz: { type: "number" }
      }
    } as JSONSchema;

    const result = validator(testSchema, {
      baz: "abc",
    }) as any;

    expect(result).toBeInstanceOf(ValidationErrors);
    expect(result.errors[0]).toBeInstanceOf(NumberValidationError);
    expect(result.errors[1]).toBeInstanceOf(ObjectValidationError);
  });
});
