import ValidationError from "../validation-error";
import { JSONSchemaBoolean } from "@json-schema-tools/meta-schema";

export default (schema: JSONSchemaBoolean, d: any): true | ValidationError => {
  if (schema === true) { return true; }
  if (schema === false) {
    return new ValidationError({ title: "alwaysFalse" }, d);
  }
  return true;
}
