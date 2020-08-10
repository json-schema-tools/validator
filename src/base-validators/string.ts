import ValidationError from "../validation-error";
import { JSONSchemaObject } from "@json-schema-tools/meta-schema";

export default (schema: JSONSchemaObject, d: any): true | ValidationError => {
  if (typeof d !== "string") {
    return new ValidationError(schema, d);
  }

  return true;
}
