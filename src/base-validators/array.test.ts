import validator, { ObjectValidationError } from "./object";

describe("array", () => {
  it("handles the basics", () => {
    expect(validator({ type: "object" }, {})).toBe(true);
    expect(validator({ type: "object" }, { foo: "123" })).toBe(true);

    expect(validator({ type: "object" }, undefined)).toBeInstanceOf(ObjectValidationError);
    expect(validator({ type: "object" }, null)).toBeInstanceOf(ObjectValidationError);
    expect(validator({ type: "object" }, 123)).toBeInstanceOf(ObjectValidationError);
    expect(validator({ type: "object" }, [])).toBeInstanceOf(ObjectValidationError);
    class Foo { }
    expect(validator({ type: "object" }, Foo)).toBeInstanceOf(ObjectValidationError);
    expect(validator({ type: "object" }, new Foo())).toBeInstanceOf(ObjectValidationError);
  });

  it("ordered arrays", () => {
    const testSchema = {
      type: "array",
      items: [
        { type: "integer" },
        { type: "string" },
        { type: "number" }
      ]
    };

    expect(validator(testSchema, { foo: 123, bar: "123", baz: 123 })).toBe(true);
    expect(validator(testSchema, { bar: 123, baz: 123 })).toBe(true);
    expect(validator(testSchema, { foo: 123 })).toBeInstanceOf(ObjectValidationError);
    expect(validator(testSchema, { foo: 123, bar: 123 })).toBeInstanceOf(ObjectValidationError);
  });

  it("handles required properties", () => {
    const testSchema = { type: "object", required: ["foo"], properties: { foo: { type: "integer" } } };
    expect(validator(testSchema, { foo: 123 })).toBe(true);
    expect(validator(testSchema, { foo: 123, bar: 123 })).toBe(true);
    expect(validator(testSchema, {})).toBeInstanceOf(ObjectValidationError);
    expect(validator(testSchema, { bar: 123 })).toBeInstanceOf(ObjectValidationError);
    expect(validator(testSchema, { bar: 123 })).toBeInstanceOf(ObjectValidationError);
  });

  it("handles min and maxProperties", () => {
    const testSchema0 = { type: "object", maxProperties: 3, minProperties: 1 };
    expect(validator(testSchema0, { foo: 123 })).toBe(true);
    expect(validator(testSchema0, { foo: 123, bar: 123, baz: 123 })).toBe(true);
    expect(validator(testSchema0, { foo: 123, bar: 123, baz: 123, boom: 123 })).toBeInstanceOf(ObjectValidationError);
    expect(validator(testSchema0, {})).toBeInstanceOf(ObjectValidationError);
  });

  it("handles propertyNames", () => {// will fail until decide on subschema validation pattern
    const testSchema0 = {
      type: "object",
      propertyNames: { maxLength: 12, minLength: 3, pattern: "foo|bar", type: "string" },
      properties: {
        foo: { type: "integer" }
      }
    };
    expect(validator(testSchema0, { foo: 123, bar: 123 })).toBe(true);
    expect(validator(testSchema0, { foo: 123, bar: 123, baz: 123 })).toBeInstanceOf(ObjectValidationError);
  });

  it("handles properties subschema validation", () => {
    const testSchema0 = {
      type: "object",
      properties: {
        foo: { type: "integer" }
      }
    };
    const result = validator(testSchema0, { foo: "bar" });
    console.error(result);
    expect(result).toBeInstanceOf(ObjectValidationError);
  });

  it("handles additionalProperties", () => { // will fail until decide on subschema validation pattern
    const testSchema0 = { type: "object", additionalProperties: false, properties: { foo: { type: "integer" } } };
    expect(validator(testSchema0, { foo: 123 })).toBe(true);
    expect(validator(testSchema0, { foo: 123, bar: 123 })).toBeInstanceOf(ObjectValidationError);

    const testSchema1 = { type: "object", additionalProperties: { type: "string" }, properties: { foo: { type: "integer" } } };
    expect(validator(testSchema0, { foo: 123 })).toBe(true);
    expect(validator(testSchema0, { foo: 123, bar: 123 })).toBeInstanceOf(ObjectValidationError);
    expect(validator(testSchema0, { foo: 123, bar: "123" })).toBe(true);

    // const testSchema = { type: "object", required: ["foo"], properties: { foo: { type: "integer" } } };
  });
});
