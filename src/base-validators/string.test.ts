import validator, { StringValidationError } from "./string";

describe("validator", () => {
  it("can validate and invalidate a string", () => {
    expect(validator({ type: "string" }, "im a string")).toBe(true);
    expect(validator({ type: "string" }, 123)).toBeInstanceOf(StringValidationError);
    expect(validator({ type: "string" }, {})).toBeInstanceOf(StringValidationError);
    expect(validator({ type: "string" }, true)).toBeInstanceOf(StringValidationError);
    expect(validator({ type: "string" }, false)).toBeInstanceOf(StringValidationError);
    expect(validator({ type: "string" }, null)).toBeInstanceOf(StringValidationError);
  });

  it("maxLength", () => {
    expect(validator({ type: "string", maxLength: 10 }, "12345678910")).toBeInstanceOf(StringValidationError);
    expect(validator({ type: "string", maxLength: 10 }, "123456789")).toBe(true);
  });

  it("minLength", () => {
    expect(validator({ type: "string", minLength: 10 }, "12345678910")).toBe(true);
    expect(validator({ type: "string", minLength: 10 }, "123456789")).toBeInstanceOf(StringValidationError);
  });

  it("pattern", () => {
    expect(validator({ type: "string", pattern: "foo" }, "foo")).toBe(true);
    expect(validator({ type: "string", pattern: "bar" }, "foo")).toBeInstanceOf(StringValidationError);
  });

  it("const", () => {
    expect(validator({ type: "string", const: "foo" }, "foo")).toBe(true);
    expect(validator({ type: "string", const: "bar" }, "foo")).toBeInstanceOf(StringValidationError);
  });

  it("enum", () => {
    expect(validator({ type: "string", enum: ["foo"] }, "foo")).toBe(true);
    expect(validator({ type: "string", enum: ["bar"] }, "foo")).toBeInstanceOf(StringValidationError);

    expect(validator({ type: "string", enum: ["foo", "bar"] }, "foo")).toBe(true);
    expect(validator({ type: "string", enum: ["foo", "bar"] }, "baz")).toBeInstanceOf(StringValidationError);

    expect(validator({ type: "string", enum: ["foo", 123, "bar"] }, "123")).toBeInstanceOf(StringValidationError);
  });
});
