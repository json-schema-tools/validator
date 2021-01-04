import { JSONSchemaObject, Properties, JSONSchema } from "@json-schema-tools/meta-schema";
import StringValidator, { StringValidationError } from "./string";
import validator, { ValidationError, ValidationErrors } from "../";

export class ObjectValidationError implements Error {
  public name = "StringValidationError";
  public message: string;

  constructor(schema: JSONSchemaObject, data: any, reason: string) {
    this.message = [
      "invalid object",
      `reason: ${reason}`,
    ].join("\n");
  }
}

export default (schema: JSONSchemaObject, d: any): true | ObjectValidationError => {
  if (d === null) {
    return new ObjectValidationError(schema, d, "null is not a valid object");
  }

  if (typeof d !== "object") {
    return new ObjectValidationError(schema, d, "not an object type");
  }

  if (d instanceof Array) {
    return new ObjectValidationError(schema, d, "array is not a valid object");
  }

  if (d.constructor.name !== "Object") {
    return new ObjectValidationError(schema, d, `${d.constructor.name} is not an object`);
  }

  const dKeys = Object.keys(d);
  if (schema.required) {
    const missingKeys = schema.required.filter((reqStr) => dKeys.indexOf(reqStr) === -1);
    if (missingKeys.length > 0) {
      const errorMsg = `missing required properties on object: ${missingKeys.join(", ")}`;
      return new ObjectValidationError(schema, d, errorMsg);
    }
  }

  if (schema.maxProperties !== undefined) {
    if (dKeys.length > schema.maxProperties) {
      return new ObjectValidationError(schema, d, `maxProperties is ${schema.maxProperties}, provided ${dKeys.length}`)
    }
  }

  if (schema.minProperties !== undefined) {
    if (dKeys.length < schema.minProperties) {
      return new ObjectValidationError(schema, d, `not enough properties. minProperties is ${schema.minProperties}`)
    }
  }

  if (schema.dependentRequired) {
    const missingDepMap: any = {};

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
      const errorMsg = [
        "Missing dependent required properties:",
      ];
      missingDeps.forEach((mDep) => {
        errorMsg.push(`the property ${mDep} is required in the presence of ${missingDepMap[mDep].join(", ")}`)
      });
      return new ObjectValidationError(schema, d, errorMsg.join("\n"));
    }
  }

  if (schema.propertyNames && schema.propertyNames !== true) {
    const propNameErrors = Object
      .keys(d)
      .reduce((errs, name) => {
        const err = StringValidator((schema.propertyNames as JSONSchemaObject), name);

        if (err instanceof StringValidationError) {
          errs.push(err);
        }

        return errs;
      }, [] as StringValidationError[]);

    if (propNameErrors.length > 0) {
      return new ObjectValidationError(
        schema,
        d,
        [
          "Invalid property name:",
          propNameErrors.map((e) => e.message).join("\n")
        ].join("\n")
      );
    }
  }

  const additionalProps = [] as any;

  if (schema.properties) {
    const props = schema.properties as Properties;

    const propertyErrors = Object.entries(d).reduce((errs, [key, val]) => {
      const schemaForKey = props[key];
      if (schemaForKey === undefined) {
        additionalProps.push(val);
        return [];
      }
      const vErr = validator(schemaForKey, val);
      if (vErr instanceof ValidationErrors) {
        errs.push(vErr);
      }
      return errs;
    }, [] as any);

    if (propertyErrors.length > 0) {
      return new ObjectValidationError(schema, d, [
        "Invalid property:",
        propertyErrors.map((e: any) => e.message).join("\n")
      ].join("\n"));
    }
  }

  if (additionalProps.length > 0) {
    additionalProps.reduce((errs: any, addProp: any) => {
      const vErr = validator(schema.additionalProperties || true as JSONSchema, addProp);
      if (vErr instanceof ValidationErrors) {
        errs.push(vErr);
      }
      return errs;
    }, [] as any);
  }

  return true;
}
