import validator from "./";
import dereferencer from "@json-schema-tools/dereferencer";
import schema, { JSONSchema } from "@json-schema-tools/meta-schema";
import ValidationError, { ValidationErrors } from "./validation-error";
import { StringValidationError, StringValidationErrorBadType } from "./base-validators/string";
import { ObjectValidationError, ObjectValidationErrorBadType } from "./base-validators/object";

describe("validating JSONSchema with meta-schema", () => {
  const passingTests = [];
  const failingTests: [any, any[]][] = [];

  passingTests.push({ title: "normalString", type: "string" });
  passingTests.push({ title: "fancyString", type: "string", minLength: 3 });

  failingTests.push([
    { title: 123, type: {} },
    [
      StringValidationError,
      StringValidationErrorBadType
    ]
  ]);

  failingTests.push([
    { title: 'badProps', type: 'object', properties: 123 },
    [
      ObjectValidationError,
      ObjectValidationErrorBadType
    ]
  ]);

  let s: JSONSchema;
  beforeAll(async () => {
    const dereffer = new dereferencer(schema);
    s = await dereffer.resolve();
  });

  passingTests.forEach((test) => {
    it(`returns true for the valid JSONSchema titled: '${(test as any).title}'`, () => {
      const result = validator(s, test);
      expect(result).not.toBeInstanceOf(ValidationErrors);
      expect(result).toBe(true);
    });
  });

  failingTests.forEach((test) => {
    const [testSchema, expectedErrors] = test;
    const errNames = expectedErrors.map((e) => e.name).join(", ");
    it(`returns ${errNames} for the invalid JSONSchema titled: '${testSchema.title}'`, () => {
      const result: any = validator(s, testSchema);

      expectedErrors.forEach((expectedErr) => {
        const found = result.errors.filter((err: ValidationError) => err instanceof expectedErr);
        expect(found.length).toBeGreaterThan(0);
      });

      expect(result).toBeInstanceOf(ValidationErrors);
    });
  });
});
