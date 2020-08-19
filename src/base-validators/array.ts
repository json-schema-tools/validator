import { JSONSchemaObject } from "@json-schema-tools/meta-schema";

export class ArrayValidationError implements Error {
  public name = "ArrayValidationError";
  public message: string;

  constructor(schema: JSONSchemaObject, data: any, reason: string) {
    this.message = [
      "invalid data provided is not a valid Array",
      `reason: ${reason}`,
    ].join("\n");
  }
}

export default (schema: JSONSchemaObject, d: any): true | ArrayValidationError => {
  if (!Array.isArray(d)) {
    return new ArrayValidationError(schema, d, "not an Array type");
  }

  if (schema.maxItems) {
    if (d.length > schema.maxItems) {
      return new ArrayValidationError(schema, d, `array cannot have more items than maxItems: ${schema.maxItems}`);
    }
  }

  if (schema.minItems) {
    if (d.length < schema.minItems) {
      return new ArrayValidationError(schema, d, `array cannot have less items than minItems: ${schema.minItems}`);
    }
  }

  if (schema.uniqueItems) {
    if (d.some((val, i) => d.indexOf(val) !== i)) {
      return new ArrayValidationError(schema, d, "uniqueItems is true in the schema, but the array contains duplicate items");
    }
  }

  if (schema.const) {
    if (JSON.stringify(d) !== JSON.stringify(schema.const)) {
      return new ArrayValidationError(schema, d, `must be: ${schema.const}`);
    }
  }

  if (schema.enum) {
    const enumArray = schema.enum.map(i => JSON.stringify(i));
    if (enumArray.indexOf(JSON.stringify(d)) === -1) {
      return new ArrayValidationError(schema, d, `must be one of: ${schema.enum}`);
    }
  }

  return true;
}
