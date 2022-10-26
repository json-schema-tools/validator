import { JSONSchema, JSONSchemaObject } from "@json-schema-tools/meta-schema";
import StringValidator from "./base-validators/string";
import BooleanValidator from "./base-validators/boolean";
import NumberValidator from "./base-validators/number";
import IntegerValidator from "./base-validators/integer";
import ObjectValidator from "./base-validators/object";
import ValidationError, { tValidationError, ValidationErrors } from "./validation-error";
import traverse from "@json-schema-tools/traverse";
import jsonpath from "jsonpath";

const validateItem = (schema: JSONSchema, data: any): true | tValidationError[] => {
  const errors: ValidationError[] = [];

  if (typeof schema === "boolean") {
    if (schema === false) {
      errors.push(new ValidationError(schema, data, "Boolean schema 'false' is always invalid"));
    }
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

// $.properties.foo -> $.foo
// $.items[0].properties.foo -> $[0].foo
// $.properties.foo.items[0].properties.bar -> $.foo[0].bar
const schemaPathToRegularPath = (path: string) => {
  const tokens = path.split(".");
  const regularPath: string[] = [];

  let pushNext = false;
  tokens.forEach((t, i) => {
    if (pushNext) {
      regularPath[regularPath.length - 1] += `['${t}']`;
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

  let errors: ValidationError[] = [];
  let errorMap: { [path: string]: ValidationError[] } = {};

  traverse(schema, (ss, isCycle, path, parent: JSONSchema) => {
    const regularPath = schemaPathToRegularPath(path);
    const [reffed] = jsonpath.query(data, regularPath);
    // console.log(path, regularPath, reffed);

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

      if (errorMap[path] === undefined) {
        errorMap[path] = result;
      } else {
        errorMap[path] = errorMap[path].concat(result);
      }
    }

    return ss;
  });

  // console.log(JSON.stringify(errorMap, null, '\t'));

  if (errors.length !== 0) {
    return new ValidationErrors(errors);
  }

  return true;
};

export default validator;

function ArrayValidator(schema: JSONSchemaObject, data: any) {
  throw new Error("Function not implemented.");
}
