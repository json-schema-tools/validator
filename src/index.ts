import { JSONSchema, JSONSchemaObject } from "@json-schema-tools/meta-schema";
import StringValidator, { StringValidationError } from "./base-validators/string";
import BooleanValidator, { BooleanValidationError } from "./base-validators/boolean";
import NumberValidator, { NumberValidationError } from "./base-validators/number";
import IntegerValidator, { IntegerValidationError } from "./base-validators/integer";
import ObjectValidator, { ObjectValidationError } from "./base-validators/object";
import ArrayValidator, { ArrayValidationError } from "./base-validators/array";

import traverse from "@json-schema-tools/traverse";
import jsonpath from "jsonpath";

// import all the different validation errors
type ValidationError =
  StringValidationError |
  BooleanValidationError |
  IntegerValidationError |
  NumberValidationError |
  ObjectValidationError |
  ArrayValidationError;

export class ValidationErrors implements Error {
  public name = "ValidationErrors";
  public message: string;

  constructor(public errors: ValidationError[]) {
    this.message = "";
  }
}

const validateItem = (schema: JSONSchema, data: any): true | ValidationError[] => {
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
  } else if (schema.type === "array") {
    const valid = ArrayValidator(schema, data);
    if (valid !== true) {
      errors.push(valid);
    }
  }

  if (errors.length === 0) {
    return true;
  }

  return errors;
};

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
  // $.properties.foo -> $.foo
  // $.items[0].properties.foo -> $[0].foo
  // $.properties.foo.items[0].properties.bar -> $.foo[0].bar
  const schemaPathToRegularPath = (path: string) => {
    const tokens = path.split(".");
    const regularPath: string[] = [];

    let pushNext = false;
    tokens.forEach((t, i) => {
      if (pushNext) {
        regularPath.push(t);
        pushNext = false;
        return;
      }

      if (t === "$") {
        return regularPath.push(t);
      }

      if (t.startsWith("items")) {
        const l = regularPath.length - 1;
        let toAppend = "";
        if (t.includes("[") && t.includes("]")) {
          toAppend = t.replace("items", "");
        } else {
          toAppend = "[*]";
        }

        regularPath[l] += toAppend
        return;
      }

      if (t === "properties") {
        pushNext = true;
        return;
      }
    });
    return regularPath.join(".");
  };

  let errors: ValidationError[] = [];

  traverse(schema, (ss, isCycle, path, parent: JSONSchema) => {
    const regularPath = schemaPathToRegularPath(path);
    let reffed = data;
    if (typeof data === "object") {
      const [r] = jsonpath.query(data, regularPath);
      reffed = r;
    }

    let result: boolean | ValidationError[] = true;
    if (reffed === undefined) {
      const p = parent as JSONSchemaObject;
      if (p.type === "object") {
        const required = p.required;
        if (required) {
          const tokens = path.split(".");
          const key = tokens[tokens.length - 1];
          if (required.includes(key)) {
            result = validateItem(ss, reffed);
          }
        }
      }
    } else {
      result = validateItem(ss, reffed);
    }

    if (result !== true) {
      errors = errors.concat(result);
    }

    return ss;
  });

  if (errors.length !== 0) {
    return new ValidationErrors(errors);
  }

  return true;
};

export default validator;
