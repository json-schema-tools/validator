import validator, {
  NumberValidationError,
  NumberValidationErrorBadType,
  NumberValidationErrorConst,
  NumberValidationErrorEnum,
  NumberValidationErrorExclusiveMaximum,
  NumberValidationErrorExclusiveMinimum,
  NumberValidationErrorMaximum,
  NumberValidationErrorMinimum,
  NumberValidationErrorMultipleOf
} from "./number";

describe("validator", () => {
  it("general NumberValidationError", () => {
    expect(validator({ type: "number" }, "123"))
      .toBeInstanceOf(NumberValidationError);
  });

  it("can validate and invalidate a number", () => {
    expect(validator({ type: "number" }, "im a number")).toBeInstanceOf(NumberValidationErrorBadType);
    expect(validator({ type: "number" }, 123)).toBe(true);
    expect(validator({ type: "number" }, {})).toBeInstanceOf(NumberValidationErrorBadType);
    expect(validator({ type: "number" }, true)).toBeInstanceOf(NumberValidationErrorBadType);
    expect(validator({ type: "number" }, false)).toBeInstanceOf(NumberValidationErrorBadType);
    expect(validator({ type: "number" }, null)).toBeInstanceOf(NumberValidationErrorBadType);
    expect(validator({ type: "number" }, 123.123)).toBe(true);
  });

  it("multipleOf", () => {
    expect(validator({ type: "number", multipleOf: 10 }, 100)).toBe(true);
    expect(validator({ type: "number", multipleOf: 100 }, 10)).toBeInstanceOf(NumberValidationErrorMultipleOf);
  });

  it("maximum", () => {
    expect(validator({ type: "number", maximum: 10 }, 10)).toBe(true);
    expect(validator({ type: "number", maximum: 10 }, 11)).toBeInstanceOf(NumberValidationErrorMaximum);
  });

  it("exclusiveMaximum", () => {
    expect(validator({ type: "number", exclusiveMaximum: 10 }, 9)).toBe(true);
    expect(validator({ type: "number", exclusiveMaximum: 10 }, 10)).toBeInstanceOf(NumberValidationErrorExclusiveMaximum);
  });

  it("minimum", () => {
    expect(validator({ type: "number", minimum: 10 }, 10)).toBe(true);
    expect(validator({ type: "number", minimum: 10 }, 9)).toBeInstanceOf(NumberValidationErrorMinimum);
  });

  it("exclusiveMinimum", () => {
    expect(validator({ type: "number", exclusiveMinimum: 10 }, 11)).toBe(true);
    expect(validator({ type: "number", exclusiveMinimum: 10 }, 10)).toBeInstanceOf(NumberValidationErrorExclusiveMinimum);
  });

  it("const", () => {
    expect(validator({ type: "number", const: 123 }, 123)).toBe(true);
    expect(validator({ type: "number", const: 456 }, 123)).toBeInstanceOf(NumberValidationErrorConst);
  });

  it("enum", () => {
    expect(validator({ type: "number", enum: [123] }, 123)).toBe(true);
    expect(validator({ type: "number", enum: [123] }, 456)).toBeInstanceOf(NumberValidationErrorEnum);

    expect(validator({ type: "number", enum: [123, 456] }, 123)).toBe(true);
    expect(validator({ type: "number", enum: [123, 456] }, 1)).toBeInstanceOf(NumberValidationErrorEnum);

    expect(validator({ type: "number", enum: ["foo", "123", "bar"] }, 123)).toBeInstanceOf(NumberValidationErrorEnum);
  });
});
