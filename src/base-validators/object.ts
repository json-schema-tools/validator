import { JSONSchemaObject } from "@json-schema-tools/meta-schema";

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
      return new ObjectValidationError(schema, d, `too many properties. maxProperties is ${schema.maxProperties}`)
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

  // warn if any of the keys are non-strings

  return true;
}
