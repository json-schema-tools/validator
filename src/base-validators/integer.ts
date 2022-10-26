import ValidationError from "../validation-error";
import { JSONSchemaObject } from "@json-schema-tools/meta-schema";
import NumberValidator, { NumberValidationError } from "./number";

export class IntegerValidationError extends ValidationError {
  public name = "IntegerValidationError";

  constructor(schema: JSONSchemaObject, data: any, message: string) {
    const msg = [
      "Invalid integer value",
      message,
    ];

    super(schema, data, msg.join("\n"));
  }
}

export class IntegerValidationErrorBadType extends IntegerValidationError {
  public name = "IntegerValidationErrorBadType";

  constructor(schema: JSONSchemaObject, data: number) {
    super(schema, data, [
      "Value must be an integer",
      `Received value has a decimal component: ${data - Math.floor(data)}`,
    ].join('\n'));
  }
}

const isInt = (num: number) => {
  if (num % 1 !== 0) {
    return false;
  }
  return true;
}

export default (schema: JSONSchemaObject, d: any): true | ValidationError => {

  const validNumber = NumberValidator(schema, d);
  if (validNumber !== true) {
    return validNumber;
  }

  if (!isInt(d)) {
    return new IntegerValidationErrorBadType(schema, d);
  }

  return true;
}
