import validator, {
  StringValidationError,
  StringValidationErrorBadType,
  StringValidationErrorConst,
  StringValidationErrorEnum,
  StringValidationErrorMaxLength,
  StringValidationErrorMinLength,
  StringValidationErrorPattern
} from "./string";

describe("validator", () => {
  it("general StringValidationError", () => {
    expect(validator({ type: "string" }, 123)).toBeInstanceOf(StringValidationError);
  });

  it("returns StringValidationBadType errors", () => {
    expect(validator({ type: "string" }, "im a string")).toBe(true);
    expect(validator({ type: "string" }, 123)).toBeInstanceOf(StringValidationErrorBadType);
    expect(validator({ type: "string" }, 123)).toBeInstanceOf(StringValidationErrorBadType);
    expect(validator({ type: "string" }, {})).toBeInstanceOf(StringValidationErrorBadType);
    expect(validator({ type: "string" }, true)).toBeInstanceOf(StringValidationErrorBadType);
    expect(validator({ type: "string" }, false)).toBeInstanceOf(StringValidationErrorBadType);
    expect(validator({ type: "string" }, null)).toBeInstanceOf(StringValidationErrorBadType);
  });

  it("maxLength", () => {
    expect(validator({ type: "string", maxLength: 10 }, "12345678910")).toBeInstanceOf(StringValidationErrorMaxLength);
    expect(validator({ type: "string", maxLength: 10 }, "123456789")).toBe(true);
  });

  it("minLength", () => {
    expect(validator({ type: "string", minLength: 10 }, "12345678910")).toBe(true);
    expect(validator({ type: "string", minLength: 10 }, "123456789")).toBeInstanceOf(StringValidationErrorMinLength);
  });

  it("pattern", () => {
    expect(validator({ type: "string", pattern: "foo" }, "foo")).toBe(true);
    expect(validator({ type: "string", pattern: "bar" }, "foo")).toBeInstanceOf(StringValidationErrorPattern);
  });

  it("const", () => {
    expect(validator({ type: "string", const: "foo" }, "foo")).toBe(true);
    expect(validator({ type: "string", const: "bar" }, "foo")).toBeInstanceOf(StringValidationErrorConst);
  });

  it("enum", () => {
    expect(validator({ type: "string", enum: ["foo"] }, "foo")).toBe(true);
    expect(validator({ type: "string", enum: ["bar"] }, "foo")).toBeInstanceOf(StringValidationErrorEnum);

    expect(validator({ type: "string", enum: ["foo", "bar"] }, "foo")).toBe(true);
    expect(validator({ type: "string", enum: ["foo", "bar"] }, "baz")).toBeInstanceOf(StringValidationErrorEnum);

    expect(validator({ type: "string", enum: ["foo", 123, "bar"] }, "123")).toBeInstanceOf(StringValidationErrorEnum);
  });
});
