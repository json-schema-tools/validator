import { JSONSchema } from "@json-schema-tools/meta-schema";
import StringValidator, { StringValidationError } from "./base-validators/string";
import BooleanValidator, { BooleanValidationError } from "./base-validators/boolean";
import NumberValidator, { NumberValidationError } from "./base-validators/number";
import IntegerValidator, { IntegerValidationError } from "./base-validators/integer";
import ObjectValidator, { ObjectValidationError } from "./base-validators/object";

// import all the different validation errors
export type ValidationError =
  StringValidationError |
  BooleanValidationError |
  IntegerValidationError |
  NumberValidationError |
  ObjectValidationError;

export class ValidationErrors implements Error {
  public name = "ValidationErrors";
  public message: string;

  constructor(public errors: ValidationError[]) {
    this.message = errors.map((err) => err.message).join("\n");
  }
}

/**
 * A validator is a function is passed a schema and some data to validate against the it.
 * Errors if your schema contains $refs. Use the json-schema-tools/dereferencer beforehand.
 * Circular references are handled.
 *
 * @param schema the schema to validate against
 * @param data the data to apply the schema to
 *
 */
const validator = (schema: JSONSchema, data: any): true | ValidationErrors => {
  const errors: ValidationError[] = [];

  if (typeof schema === "boolean") {
    const valid = BooleanValidator(schema, data);
    if (valid !== true) {
      errors.push(valid);
    }
  } else if (schema.type === "string") {
    const valid = StringValidator(schema, data);
    if (valid !== true) {
      errors.push(valid);
    }
  } else if (schema.type === "integer") {
    const valid = IntegerValidator(schema, data);
    if (valid !== true) {
      errors.push(valid);
    }
  } else if (schema.type === "number") {
    const valid = NumberValidator(schema, data);
    if (valid !== true) {
      errors.push(valid);
    }
  } else if (schema.type === "object") {
    const valid = ObjectValidator(schema, data);
    if (valid !== true) {
      errors.push(valid);
    }
  }

  if (errors.length === 0) {
    return true;
  }

  return new ValidationErrors(errors);
};

export default validator;
