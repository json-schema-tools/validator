import validator, { ArrayValidationError } from "./array";

describe("validator", () => {
  it("can validate and invalidate a array", () => {
    expect(validator({ type: "array" }, "im an array")).toBeInstanceOf(ArrayValidationError);
    expect(validator({ type: "array" }, [])).toBe(true);
    expect(validator({ type: "array" }, {})).toBeInstanceOf(ArrayValidationError);
    expect(validator({ type: "array" }, true)).toBeInstanceOf(ArrayValidationError);
    expect(validator({ type: "array" }, false)).toBeInstanceOf(ArrayValidationError);
    expect(validator({ type: "array" }, null)).toBeInstanceOf(ArrayValidationError);
    expect(validator({ type: "array" }, 123)).toBeInstanceOf(ArrayValidationError);
    expect(validator({ type: "array" }, [123, 234, 123234])).toBe(true);
    expect(validator({ type: "array" }, [123, "string"])).toBe(true);
  });

  it("minItems", () => {
    expect(validator({ type: "array", minItems: 2 }, [100,10])).toBe(true);
    expect(validator({ type: "array", minItems: 2 }, [10])).toBeInstanceOf(ArrayValidationError);
  });

  it("maxItems", () => {
    expect(validator({ type: "array", maxItems: 2 }, [10,11])).toBe(true);
    expect(validator({ type: "array", maxItems: 2 }, [11, 10, 9])).toBeInstanceOf(ArrayValidationError);
  });

  it("uniqueItems", () => {
    expect(validator({ type: "array", uniqueItems: true }, [9, 7])).toBe(true);
    expect(validator({ type: "array", uniqueItems: true }, [9, 9])).toBeInstanceOf(ArrayValidationError);
    expect(validator({ type: "array", uniqueItems: false }, [10, 10])).toBe(true);
  });

  it("const", () => {
    expect(validator({ type: "array", const: [123, 321] }, [123, 321])).toBe(true);
    expect(validator({ type: "array", const: [456, 123] }, [123])).toBeInstanceOf(ArrayValidationError);
  });

  it("enum", () => {
    expect(validator({ type: "array", enum: [[123]] }, [123])).toBe(true);
    expect(validator({ type: "array", enum: [[123]] }, 123)).toBeInstanceOf(ArrayValidationError);
  });
});
