import { JSONSchemaObject, Properties, JSONSchema } from "@json-schema-tools/meta-schema";
import StringValidator, { StringValidationError } from "./string";
import validator, { ValidationError, ValidationErrors } from "../";

export class ArrayValidationError implements Error {
  public name = "ArrayValidationError";
  public message: string;

  constructor(schema: JSONSchemaObject, data: any, reason: string) {
    this.message = [
      "invalid object",
      `reason: ${reason}`,
    ].join("\n");
  }
}

const handleAdditionalItems = (schema: JSONSchemaObject, dItem: any) => {
  if (schema.additionalItems) {
    const addItemsError = validator(schema.additionalItems, dItem);
    if (addItemsError instanceof ValidationErrors) {
      return addItemsError;
    } else {
      return true;
    }
  }
  return new ArrayValidationError(
    schema,
    dItem,
    `Additional Items schema not provided..`
  );
}

const handleUnevaluatedItems = (schema: JSONSchemaObject, dItem: any) => {
  if (schema.unevaluatedItems) {
    const unevaluatedItemsError = validator(schema.unevaluatedItems, dItem);
    if (unevaluatedItemsError instanceof ValidationErrors) {
      return false;
    } else {
      return true;
    }
  }
  return false;
}

export default (schema: JSONSchemaObject, d: any): true | ArrayValidationError => {
  if (d === null) {
    return new ArrayValidationError(schema, d, "null is not a valid array");
  }

  if (d instanceof Array === false) {
    return new ArrayValidationError(schema, d, "instanceof Array check failed. Not an array.");
  }

  if (schema.maxItems !== undefined) {
    if (d.length > schema.maxItems) {
      return new ArrayValidationError(
        schema,
        d,
        `Too many items. maxItems is ${schema.maxItems}, provided ${d.length}`
      );
    }
  }

  if (schema.minItems !== undefined) {
    if (d.length < schema.minItems) {
      return new ArrayValidationError(
        schema,
        d,
        `Not enough items. minItems is ${schema.minItems}`
      );
    }
  }

  const additionalItems = [] as any;

  if (schema.items) {
    if (schema.items instanceof Array) {
      const itemSchemas = schema.items as JSONSchema[];

      const annotationResults = [] as any;
      d.forEach((dItem: any[], i: number) => {
        if (i >= itemSchemas.length) {
          annotationResults.push(handleAdditionalItems(schema, dItem));
        } else {
          const vErr = validator(itemSchemas[i], dItem);
          if (vErr instanceof ValidationErrors) {
            const additionalItemsAnnotation = handleAdditionalItems(schema, dItem);
            if (additionalItemsAnnotation !== true) {
              const unevaluatedItems = handleUnevaluatedItems(schema, dItem);
              if (!unevaluatedItems) {

              }
              annotationResults.push(new ArrayValidationError(schema, dItem, [
                `Expected ordered array, but the data item at position ${i} is invalid.`,
                `The data is also not a valid schema.additionalItems`,
                additionalItemsAnnotation.message,
              ].join("\n")));
            }
          }
          annotationResults.push(true);
        }
      })

      for (let i = 0; i <= annotationResults.length; i++) {
        if (annotationResults[i] !== true) {
          return annotationResults[i];
        }
      }
    }
  }


  return true;
};
