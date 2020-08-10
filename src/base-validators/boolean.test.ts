import validator from "./boolean";
import ValidationError from "../validation-error";

describe("Boolean validation", () => {
  it("always returns true for boolean: true schema", () => {
    expect(validator(true, "im a string")).toBe(true);
    expect(validator(true, 123)).toBe(true);
    expect(validator(true, {})).toBe(true);
  });

  it("always returns an error for boolean: false schema", () => {
    expect(validator(false, "im a string")).toBeInstanceOf(ValidationError);
    expect(validator(false, 123)).toBeInstanceOf(ValidationError);
    expect(validator(false, {})).toBeInstanceOf(ValidationError);
  });
});
