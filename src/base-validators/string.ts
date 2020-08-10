import { JSONSchemaObject } from "@json-schema-tools/meta-schema";

export class StringValidationError implements Error {
  public name = "StringValidationError";
  public message: string;

  constructor(schema: JSONSchemaObject, data: any, reason: string) {
    this.message = [
      "invalid data provided is not a valid string",
      `reason: ${reason}`,
    ].join("\n");
  }
}

export default (schema: JSONSchemaObject, d: any): true | StringValidationError => {
  if (typeof d !== "string") {
    return new StringValidationError(schema, d, "not a string type");
  }

  if (schema.maxLength) {
    if (d.length > schema.maxLength) {
      return new StringValidationError(schema, d, `cannot be longer than maxLength: ${schema.maxLength}`);
    }
  }

  if (schema.minLength) {
    if (d.length <= schema.minLength) {
      return new StringValidationError(schema, d, `cannot be shorter than minLength: ${schema.minLength}`);
    }
  }

  if (schema.pattern) {
    const reg = new RegExp(schema.pattern);
    if (reg.test(d) === false) {
      return new StringValidationError(schema, d, `must match pattern: ${schema.pattern}`);
    }
  }

  if (schema.const) {
    if (d !== schema.const) {
      return new StringValidationError(schema, d, `must be: ${schema.const}`);
    }
  }

  if (schema.enum) {
    if (schema.enum.indexOf(d) === -1) {
      return new StringValidationError(schema, d, `must be one of: ${schema.enum}`);
    }
  }

  return true;
}
