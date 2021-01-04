import { JSONSchemaObject } from "@json-schema-tools/meta-schema";

export class NumberValidationError implements Error {
  public name = "NumberValidationError";
  public message: string;

  constructor(schema: JSONSchemaObject, data: any, reason: string) {
    this.message = [
      "invalid data provided is not a valid integer",
      `reason: ${reason}`,
    ].join("\n");
  }
}
export default (schema: JSONSchemaObject, d: any): true | NumberValidationError => {
  if (typeof d !== "number") {
    return new NumberValidationError(schema, d, `Not a number type. Received type ${typeof d}`);
  }

  if (schema.multipleOf) {
    if (d % schema.multipleOf !== 0) {
      return new NumberValidationError(schema, d, `number is not a multiple of ${schema.multipleOf}`);
    }
  }

  if (schema.maximum) {
    if (d > schema.maximum) {
      return new NumberValidationError(schema, d, `number exceeds maximum of ${schema.maximum}`);
    }
  }

  if (schema.exclusiveMaximum) {
    if (d >= schema.exclusiveMaximum) {
      return new NumberValidationError(
        schema,
        d,
        `number is greater than or equal to exclusive maximum of ${schema.exclusiveMaximum}`
      );
    }
  }

  if (schema.minimum) {
    if (d < schema.minimum) {
      return new NumberValidationError(schema, d, `number is less than minimum of ${schema.minimum}`);
    }
  }

  if (schema.exclusiveMinimum) {
    if (d <= schema.exclusiveMinimum) {
      return new NumberValidationError(
        schema,
        d,
        `number is less than or equal to exclusive minimum of ${schema.exclusiveMinimum}`
      );
    }
  }

  if (schema.const) {
    if (d !== schema.const) {
      return new NumberValidationError(schema, d, `must be: ${schema.const}`);
    }
  }

  if (schema.enum) {
    if (schema.enum.indexOf(d) === -1) {
      return new NumberValidationError(schema, d, `must be one of: ${schema.enum}`);
    }
  }

  return true;
}
