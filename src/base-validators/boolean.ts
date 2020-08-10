import ValidationError from "../validation-error";
import { JSONSchemaBoolean } from "@json-schema-tools/meta-schema";

export class BooleanValidationError implements Error {
  public name = "StringValidationError";
  public message: string;

  constructor() {
    this.message = "always invalid";
  }
}


export default (schema: JSONSchemaBoolean, d: any): true | ValidationError => {
  if (schema === false) {
    return new BooleanValidationError();
  }

  return true;
}
