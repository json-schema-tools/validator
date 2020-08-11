import ValidationError from "../validation-error";
import { JSONSchemaObject } from "@json-schema-tools/meta-schema";

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
  if (typeof d !== "number") {
    return new IntegerValidationError(schema, d, "Not a number type");
  }

  if (!isInt(d)) {
    return new IntegerValidationError(schema, d, "provided number is a float, not an integer");
  }

  if (schema.multipleOf) {
    if (!isInt(d / schema.multipleOf)) {
      return new IntegerValidationError(schema, d, `number is not a multiple of ${schema.multipleOf}`);
    }
  }

  if (schema.maximum) {
    if (d > schema.maximum) {
      return new IntegerValidationError(schema, d, `number exceeds maximum of ${schema.maximum}`);
    }
  }

  if (schema.exclusiveMaximum) {
    if (d >= schema.exclusiveMaximum) {
      return new IntegerValidationError(
        schema,
        d,
        `number is greater than or equal to exclusive maximum of ${schema.exclusiveMaximum}`
      );
    }
  }

  if (schema.minimum) {
    if (d < schema.minimum) {
      return new IntegerValidationError(schema, d, `number is less than minimum of ${schema.minimum}`);
    }
  }

  if (schema.exclusiveMinimum) {
    if (d <= schema.exclusiveMinimum) {
      return new IntegerValidationError(
        schema,
        d,
        `number is less than or equal to exclusive minimum of ${schema.exclusiveMinimum}`
      );
    }
  }

  if (schema.const) {
    if (d !== schema.const) {
      return new IntegerValidationError(schema, d, `must be: ${schema.const}`);
    }
  }

  if (schema.enum) {
    if (schema.enum.indexOf(d) === -1) {
      return new IntegerValidationError(schema, d, `must be one of: ${schema.enum}`);
    }
  }

  return true;
}
