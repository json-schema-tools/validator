import { JSONSchemaObject } from "@json-schema-tools/meta-schema";

export class OneOfValidationError implements Error {
  public name = "OneOfValidationError";
  public message: string;

  constructor(schema: JSONSchemaObject, data: any, reason: string) {
    this.message = [
      "invalid oneOf",
      `reason: ${reason}`,
    ].join("\n");
  }
}
