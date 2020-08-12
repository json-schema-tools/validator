import ValidationError from "../validation-error";
import { JSONSchemaObject } from "@json-schema-tools/meta-schema";
import NumberValidator, { NumberValidationError } from "./number";

export class IntegerValidationError implements Error {
  public name = "IntegerValidationError";
  public message: string;

  constructor(schema: JSONSchemaObject, data: any, reason: string) {
    this.message = [
      "invalid data provided is not a valid integer",
      `reason: ${reason}`,
    ].join("\n");
  }
}

const isInt = (num: number) => {
  if (num % 1 !== 0) {
    return false;
  }
  return true;
}

export default (schema: JSONSchemaObject, d: any): true | ValidationError => {

  const validNumber  = NumberValidator(schema, d);
  if (validNumber !== true) {
    return validNumber;
  }

  if (!isInt(d)) {
    return new IntegerValidationError(schema, d, "provided number is a float, not an integer");
  }

  return true;
}
