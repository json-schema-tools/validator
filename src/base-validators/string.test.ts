import validator from "./string";
import ValidationError from "../validation-error";

describe("validator", () => {
  it("can validate and invalidate a string", () => {
    expect(validator({ type: "string" }, "im a string")).toBe(true);
    expect(validator({ type: "string" }, 123)).toBeInstanceOf(ValidationError);
    expect(validator({ type: "string" }, {})).toBeInstanceOf(ValidationError);
    expect(validator({ type: "string" }, true)).toBeInstanceOf(ValidationError);
    expect(validator({ type: "string" }, false)).toBeInstanceOf(ValidationError);
    expect(validator({ type: "string" }, null)).toBeInstanceOf(ValidationError);
  });
});
