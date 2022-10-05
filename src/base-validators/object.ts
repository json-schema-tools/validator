import { JSONSchemaObject } from "@json-schema-tools/meta-schema";
import ValidationError from "../validation-error";

export class ObjectValidationError extends ValidationError {
  public name = "ObjectValidationError";

  constructor(schema: JSONSchemaObject, data: any, public message: string) {
    const msg = [
      "Invalid object value",
      message,
    ];
    super(schema, data, msg.join("\n"));
  }
}

export class ObjectValidationErrorBadType extends ObjectValidationError {
  public name = "ObjectValidationErrorBadType";

  constructor(schema: JSONSchemaObject, data: any) {
    const msg = [
      "Value must be of type 'object'",
    ];

    if (data === null) {
      msg.push("'null' is not valid as an object type");
    } else if (data instanceof Array) {
      msg.push("Arrays are not valid objects");
    } else if (typeof data !== "object") {
      msg.push(`Received type: ${typeof data}`);
    } else {
      msg.push(`${data.constructor.name} is not an object`);
    }

    super(schema, data, msg.join('\n'));
  }
}

export class ObjectValidationErrorRequired extends ObjectValidationError {
  public name = "ObjectValidationErrorRequired";

  constructor(schema: JSONSchemaObject, data: any, missing: string[]) {
    super(schema, data, [
      "Value must have a property for every item in the field 'required`",
      `Missing properties: ${missing.join(", ")}`,
    ].join('\n'));
  }
}

export class ObjectValidationErrorMaxProperties extends ObjectValidationError {
  public name = "ObjectValidationErrorMaxProperties";

  constructor(schema: JSONSchemaObject, data: any, numProps: number) {
    const max = schema.maxProperties as number;
    super(schema, data, [
      `Value must have less than or equal to ${max} properties`,
      `Received an object with ${numProps} properties`,
      `difference: ${numProps} - ${max} = ${numProps - max}`,
    ].join('\n'));
  }
}

export class ObjectValidationErrorMinProperties extends ObjectValidationError {
  public name = "ObjectValidationErrorMinProperties";

  constructor(schema: JSONSchemaObject, data: any, numProps: number) {
    const min = schema.minProperties as number;

    super(schema, data, [
      `Value must have greater than or equal to ${min} properties`,
      `Received an object with ${numProps} properties`,
      `difference: ${numProps} - ${min} = ${numProps - min}`,
    ].join('\n'));
  }
}

export class ObjectValidationErrorDependentRequired extends ObjectValidationError {
  public name = "ObjectValidationErrorRequired";

  constructor(schema: JSONSchemaObject, data: any, missing: string[][]) {
    const msg = [
      "Missing dependent required properties:",
    ];

    missing.forEach((mDep) => {
      msg.push(`the property '${mDep[1]}' depends on the missing property '${mDep[0]}`);
    });

    super(schema, data, msg.join('\n'));
  }
}


export default (schema: JSONSchemaObject, d: any): true | ObjectValidationError => {
  if (
    d === null ||
    typeof d !== "object" ||
    d instanceof Array ||
    d.constructor.name !== "Object"
  ) {
    return new ObjectValidationErrorBadType(schema, d);
  }

  const dKeys = Object.keys(d);
  if (schema.required) {
    const missingKeys = schema.required.filter(
      (reqStr) => dKeys.indexOf(reqStr) === -1
    );
    if (missingKeys.length > 0) {
      return new ObjectValidationErrorRequired(schema, d, missingKeys);
    }
  }

  if (schema.maxProperties !== undefined) {
    if (dKeys.length > schema.maxProperties) {
      return new ObjectValidationErrorMaxProperties(schema, d, dKeys.length);
    }
  }

  if (schema.minProperties !== undefined) {
    if (dKeys.length < schema.minProperties) {
      return new ObjectValidationErrorMinProperties(schema, d, dKeys.length);
    }
  }

  if (schema.dependentRequired) {
    const missingDepMap: { [k: string]: string[] } = {};

    Object.entries(schema.dependentRequired).forEach(([ifKey, reqKeys]: [string, any]) => {
      if (dKeys.indexOf(ifKey) !== -1) {
        reqKeys.forEach((k: string) => {
          if (dKeys.indexOf(k) === -1) {
            if (missingDepMap[k]) {
              return missingDepMap[k].push(ifKey);
            }
            missingDepMap[k] = [ifKey];
          }
        });
      }
    });

    const missingDeps = Object.keys(missingDepMap);
    if (missingDeps.length > 0) {
      const missing = missingDeps.map((mDep) => [mDep, missingDepMap[mDep].join(", ")]);
      return new ObjectValidationErrorDependentRequired(schema, d, missing);
    }
  }

  // warn if any of the keys are non-strings

  return true;
}
