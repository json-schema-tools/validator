import validator, { IntegerValidationError, IntegerValidationErrorBadType } from "./integer";
import { NumberValidationError } from "./number";

describe("validator", () => {
  it("can validate and invalidate a integer", () => {
    expect(validator({ type: "integer" }, 123)).toBe(true);
    expect(validator({ type: "integer" }, "this is an integer")).toBeInstanceOf(NumberValidationError);
    expect(validator({ type: "integer" }, 123.10)).toBeInstanceOf(IntegerValidationError);
    expect(validator({ type: "integer" }, 123.10)).toBeInstanceOf(IntegerValidationErrorBadType);
  });
});
