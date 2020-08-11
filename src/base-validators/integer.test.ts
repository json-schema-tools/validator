import validator, { IntegerValidationError } from "./integer";

describe("validator", () => {
  it("can validate and invalidate a integer", () => {
    expect(validator({ type: "integer" }, "im a integer")).toBeInstanceOf(IntegerValidationError);
    expect(validator({ type: "integer" }, 123)).toBe(true);
    expect(validator({ type: "integer" }, {})).toBeInstanceOf(IntegerValidationError);
    expect(validator({ type: "integer" }, true)).toBeInstanceOf(IntegerValidationError);
    expect(validator({ type: "integer" }, false)).toBeInstanceOf(IntegerValidationError);
    expect(validator({ type: "integer" }, null)).toBeInstanceOf(IntegerValidationError);
    expect(validator({ type: "integer" }, 123.123)).toBeInstanceOf(IntegerValidationError);
  });

  it("multipleOf", () => {
    expect(validator({ type: "integer", multipleOf: 10 }, 100)).toBe(true);
    expect(validator({ type: "integer", multipleOf: 100 }, 10)).toBeInstanceOf(IntegerValidationError);
  });

  it("maximum", () => {
    expect(validator({ type: "integer", maximum: 10 }, 10)).toBe(true);
    expect(validator({ type: "integer", maximum: 10 }, 11)).toBeInstanceOf(IntegerValidationError);
  });

  it("exclusiveMaximum", () => {
    expect(validator({ type: "integer", exclusiveMaximum: 10 }, 9)).toBe(true);
    expect(validator({ type: "integer", exclusiveMaximum: 10 }, 10)).toBeInstanceOf(IntegerValidationError);
  });

  it("minimum", () => {
    expect(validator({ type: "integer", minimum: 10 }, 10)).toBe(true);
    expect(validator({ type: "integer", minimum: 10 }, 9)).toBeInstanceOf(IntegerValidationError);
  });

  it("exclusiveMinimum", () => {
    expect(validator({ type: "integer", exclusiveMinimum: 10 }, 11)).toBe(true);
    expect(validator({ type: "integer", exclusiveMinimum: 10 }, 10)).toBeInstanceOf(IntegerValidationError);
  });

  it("const", () => {
    expect(validator({ type: "integer", const: 123 }, 123)).toBe(true);
    expect(validator({ type: "integer", const: 456 }, 123)).toBeInstanceOf(IntegerValidationError);
  });

  it("enum", () => {
    expect(validator({ type: "integer", enum: [123] }, 123)).toBe(true);
    expect(validator({ type: "integer", enum: [123] }, 456)).toBeInstanceOf(IntegerValidationError);

    expect(validator({ type: "integer", enum: [123, 456] }, 123)).toBe(true);
    expect(validator({ type: "integer", enum: [123, 456] }, 1)).toBeInstanceOf(IntegerValidationError);

    expect(validator({ type: "integer", enum: ["foo", "123", "bar"] }, 123)).toBeInstanceOf(IntegerValidationError);
  });
});
