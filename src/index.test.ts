import validator, { ValidationErrors } from "./";

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
    };

    const result0 = validator(testSchema, {
      foo: "abc",
      bar: [123]
    });

    expect(result0).toBe(true);

    const result1 = validator(testSchema, {
      foo: "wrong",
      bar: [123]
    });

    expect(result1).toBeInstanceOf(ValidationErrors);
  });
});
