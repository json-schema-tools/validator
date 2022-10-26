import { JSONSchemaObject } from "@json-schema-tools/meta-schema";
import validator, { ObjectValidationError, ObjectValidationErrorBadType, ObjectValidationErrorDependentRequired, ObjectValidationErrorMaxProperties, ObjectValidationErrorMinProperties, ObjectValidationErrorRequired } from "./object";

describe("validator", () => {
  it("general ObjectValidationError", () => {
    expect(validator({ type: "object" }, "123"))
      .toBeInstanceOf(ObjectValidationError);
  });

  it("handles the basics", () => {
    expect(validator({ type: "object" }, {})).toBe(true);
    expect(validator({ type: "object" }, { foo: "123" })).toBe(true);

    expect(validator({ type: "object" }, undefined)).toBeInstanceOf(ObjectValidationErrorBadType);
    expect(validator({ type: "object" }, null)).toBeInstanceOf(ObjectValidationErrorBadType);
    expect(validator({ type: "object" }, 123)).toBeInstanceOf(ObjectValidationErrorBadType);
    expect(validator({ type: "object" }, [])).toBeInstanceOf(ObjectValidationErrorBadType);
    class Foo { }
    expect(validator({ type: "object" }, Foo)).toBeInstanceOf(ObjectValidationErrorBadType);
    expect(validator({ type: "object" }, new Foo())).toBeInstanceOf(ObjectValidationErrorBadType);
  });

  it("dependentRequired", () => {
    const testSchema = {
      type: "object",
      dependentRequired: { foo: ["bar", "baz"] },
      properties: {
        foo: { type: "integer" },
        bar: { type: "integer" },
        baz: { type: "integer" }
      }
    } as JSONSchemaObject;

    expect(validator(testSchema, { foo: 123, bar: 123, baz: 123 })).toBe(true);
    expect(validator(testSchema, { bar: 123, baz: 123 })).toBe(true);
    expect(validator(testSchema, { foo: 123 })).toBeInstanceOf(ObjectValidationErrorDependentRequired);
    expect(validator(testSchema, { foo: 123, bar: 123 })).toBeInstanceOf(ObjectValidationErrorDependentRequired);
  });

  it("handles required properties", () => {
    const testSchema = {
      type: "object",
      required: ["foo"],
      properties: {
        foo: { type: "integer" }
      }
    } as JSONSchemaObject;
    expect(validator(testSchema, { foo: 123 })).toBe(true);
    expect(validator(testSchema, { foo: 123, bar: 123 })).toBe(true);
    expect(validator(testSchema, {})).toBeInstanceOf(ObjectValidationErrorRequired);
    expect(validator(testSchema, { bar: 123 })).toBeInstanceOf(ObjectValidationErrorRequired);
    expect(validator(testSchema, { bar: 123 })).toBeInstanceOf(ObjectValidationErrorRequired);
  });

  it("handles min and maxProperties", () => {
    const testSchema0 = {
      type: "object",
      maxProperties: 3,
      minProperties: 1
    } as JSONSchemaObject;
    expect(validator(testSchema0, { foo: 123 })).toBe(true);
    expect(validator(testSchema0, { foo: 123, bar: 123, baz: 123 })).toBe(true);
    expect(validator(testSchema0, { foo: 123, bar: 123, baz: 123, boom: 123 })).toBeInstanceOf(ObjectValidationErrorMaxProperties);
    expect(validator(testSchema0, {})).toBeInstanceOf(ObjectValidationErrorMinProperties);
  });

  // it("handles propertyNames", () => {// will fail until decide on subschema validation pattern
  //   const testSchema0 = {
  //     type: "object",
  //     propertyNames: { maxLength: 12, minLength: 3, pattern: "foo|bar" },
  //     properties: {
  //       foo: { type: "integer" }
  //     }
  //   };
  //   expect(validator(testSchema0, { foo: 123, bar: 123 })).toBe(true);
  //   expect(validator(testSchema0, { foo: 123, bar: 123, baz: 123 })).toBeInstanceOf(ObjectValidationError);
  // });

  // it("handles additionalProperties", () => { // will fail until decide on subschema validation pattern
  //   const testSchema0 = { type: "object", additionalProperties: false, properties: { foo: { type: "integer" } } };
  //   expect(validator(testSchema0, { foo: 123 })).toBe(true);
  //   expect(validator(testSchema0, { foo: 123, bar: 123 })).toBeInstanceOf(ObjectValidationError);

  //   const testSchema1 = { type: "object", additionalProperties: { type: "string" }, properties: { foo: { type: "integer" } } };
  //   expect(validator(testSchema0, { foo: 123 })).toBe(true);
  //   expect(validator(testSchema0, { foo: 123, bar: 123 })).toBeInstanceOf(ObjectValidationError);
  //   expect(validator(testSchema0, { foo: 123, bar: "123" })).toBe(true);

  //   // const testSchema = { type: "object", required: ["foo"], properties: { foo: { type: "integer" } } };
  // });
});
