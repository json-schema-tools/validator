import validator, { ValidationErrors } from "./";
import { JSONSchema } from "@json-schema-tools/meta-schema";
import { ObjectValidationError } from "./base-validators/object";
import { NumberValidationError } from "./base-validators/number";
import { StringValidationError } from "./base-validators/string";

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

  describe("property names with special characters (#198)", () => {
    it("validates a property with a dash in its name", () => {
      const testSchema = {
        title: "Validation Test",
        type: "object",
        properties: {
          "Some-Prop": { type: "string" },
        },
      } as JSONSchema;

      expect(validator(testSchema, { "Some-Prop": "ok" })).toBe(true);
    });

    it("errors on the property itself when a dashed property has the wrong type", () => {
      const testSchema = {
        title: "Validation Test",
        type: "object",
        properties: {
          "Some-Prop": { type: "string" },
        },
      } as JSONSchema;

      const result = validator(testSchema, { "Some-Prop": 42 });

      expect(result).toBeInstanceOf(ValidationErrors);
      expect((result as ValidationErrors).errors.length).toBe(1);
      expect((result as ValidationErrors).errors[0]).toBeInstanceOf(StringValidationError);
    });

    it("validates a property with a space in its name", () => {
      const testSchema = {
        type: "object",
        properties: {
          "my prop": { type: "string" },
        },
      } as JSONSchema;

      expect(validator(testSchema, { "my prop": "ok" })).toBe(true);

      const result = validator(testSchema, { "my prop": 42 });
      expect(result).toBeInstanceOf(ValidationErrors);
    });

    it("validates a property with a dot in its name", () => {
      const testSchema = {
        type: "object",
        properties: {
          "a.b": { type: "string" },
        },
      } as JSONSchema;

      expect(validator(testSchema, { "a.b": "ok" })).toBe(true);

      const result = validator(testSchema, { "a.b": 42 });
      expect(result).toBeInstanceOf(ValidationErrors);
    });

    it("validates nested properties with special characters", () => {
      const testSchema = {
        type: "object",
        properties: {
          "a-b": {
            type: "object",
            properties: {
              "c d": { type: "string" },
            },
          },
        },
      } as JSONSchema;

      expect(validator(testSchema, { "a-b": { "c d": "ok" } })).toBe(true);

      const result = validator(testSchema, { "a-b": { "c d": 42 } });
      expect(result).toBeInstanceOf(ValidationErrors);
    });

    it("validates a dashed property nested inside array items", () => {
      const testSchema = {
        type: "object",
        properties: {
          "my-arr": {
            type: "array",
            items: {
              type: "object",
              properties: {
                "x-y": { type: "string" },
              },
            },
          },
        },
      } as JSONSchema;

      expect(validator(testSchema, { "my-arr": [{ "x-y": "ok" }] })).toBe(true);

      const result = validator(testSchema, { "my-arr": [{ "x-y": 42 }] });
      expect(result).toBeInstanceOf(ValidationErrors);
    });

    it("validates a dashed property inside tuple items", () => {
      const testSchema = {
        type: "object",
        properties: {
          tup: {
            type: "array",
            items: [
              { type: "string" },
              {
                type: "object",
                properties: {
                  "x-y": { type: "number" },
                },
              },
            ],
          },
        },
      } as JSONSchema;

      expect(validator(testSchema, { tup: ["s", { "x-y": 1 }] })).toBe(true);

      const result = validator(testSchema, { tup: ["s", { "x-y": "nope" }] });
      expect(result).toBeInstanceOf(ValidationErrors);
    });

    it("validates a dashed property inside allOf", () => {
      const testSchema = {
        type: "object",
        allOf: [
          {
            properties: {
              "Some-Prop": { type: "string" },
            },
          },
        ],
      } as JSONSchema;

      expect(validator(testSchema, { "Some-Prop": "ok" })).toBe(true);

      const result = validator(testSchema, { "Some-Prop": 42 });
      expect(result).toBeInstanceOf(ValidationErrors);
    });

    it("validates a property with a double quote in its name", () => {
      const testSchema = {
        type: "object",
        properties: {
          'a"b': { type: "string" },
        },
      } as JSONSchema;

      expect(validator(testSchema, { 'a"b': "ok" })).toBe(true);

      const result = validator(testSchema, { 'a"b': 42 });
      expect(result).toBeInstanceOf(ValidationErrors);
    });

    it("treats a property literally named items as a property", () => {
      const testSchema = {
        type: "object",
        properties: {
          items: { type: "string" },
        },
      } as JSONSchema;

      expect(validator(testSchema, { items: "ok" })).toBe(true);

      const result = validator(testSchema, { items: 42 });
      expect(result).toBeInstanceOf(ValidationErrors);
    });
  });
});
