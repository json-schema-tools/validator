import { JSONSchema } from "@json-schema-tools/meta-schema";
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
  // Converts a traverse jsonpath (e.g. `$.properties["Some-Prop"].items[0]`)
  // into a jsonpath over the data (e.g. `$["Some-Prop"][0]`).
  // - `$.properties.foo` -> `$["foo"]`
  // - `$.properties["Some-Prop"]` -> `$["Some-Prop"]`
  // - `$.items[0].properties.foo` -> `$[0]["foo"]`
  // - `$.properties.foo.items` (single schema) -> `$["foo"][*]`
  const schemaPathToRegularPath = (path: string): string => {
    // Tokenize the path without splitting inside ["quoted"] segments. Quoted
    // names may contain dots, dashes, spaces, or escaped quotes (traverse >=
    // 1.11 emits every non-identifier key this way).
    const segments: (string | number)[] = [];
    const tokenPattern = /\["((?:[^"\\]|\\.)*)"\]|\[(\d+)\]|\.([^.[\]]+)/g;
    let match: RegExpExecArray | null;
    const rest = path.slice(1); // strip the leading "$"; traverse paths are $-rooted
    while ((match = tokenPattern.exec(rest)) !== null) {
      if (match[1] !== undefined) {
        // quoted property name; unescape (e.g. \" -> ")
        segments.push(JSON.parse(`"${match[1]}"`));
      } else if (match[2] !== undefined) {
        segments.push(Number(match[2]));
      } else {
        segments.push(match[3]);
      }
    }

    // jsonpath bracket-notation for a property name. The jsonpath lib does not
    // process escapes inside "...", so names containing a double quote use '...'.
    const bracketName = (name: string): string =>
      name.includes('"') ? `['${name}']` : `[${JSON.stringify(name)}]`;

    const regularPath: string[] = ["$"];
    let expectPropName = false;
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];

      // the segment after "properties" is always a property name, even when
      // the name itself is "properties" or "items"
      if (expectPropName) {
        // traverse only ever emits string keys after "properties"
        regularPath.push(bracketName(seg as string));
        expectPropName = false;
        continue;
      }

      if (seg === "properties") {
        expectPropName = true;
        continue;
      }

      if (seg === "items") {
        const next = segments[i + 1];
        if (typeof next === "number") {
          // tuple items: $.properties.foo.items[0] -> $["foo"][0]
          regularPath[regularPath.length - 1] += `[${next}]`;
          i++;
        } else {
          // single-schema items: $.properties.foo.items -> $["foo"][*]
          regularPath[regularPath.length - 1] += "[*]";
        }
        continue;
      }

      // any other keyword (allOf[0], patternProperties, ...) has no data-path
      // mapping; its subschema is validated against the enclosing data, as before
    }

    return regularPath.join("");
  };

  let errors: ValidationError[] = [];

  traverse(schema, (ss, isCycle, path) => {
    const regularPath = schemaPathToRegularPath(path);
    let reffed = data;
    if (data instanceof Object) {
      const [r] = jsonpath.query(data, regularPath);
      reffed = r;
    }

    if (reffed !== undefined) {
      const result = validateItem(ss, reffed);
      if (result !== true) {
        errors = errors.concat(result);
      }
    }

    return ss;
  });

  if (errors.length !== 0) {
    return new ValidationErrors(errors);
  }

  return true;
};

export default validator;
