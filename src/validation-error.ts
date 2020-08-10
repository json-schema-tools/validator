import { JSONSchemaObject } from "@json-schema-tools/meta-schema";

export default class ValidationError implements Error {
  public name = "ValidationError";
  public message: string;

  constructor(schema: JSONSchemaObject, data: any, reason: string) {
    this.message = [
      `Invalid data provided for the schema: ${(schema.title) ? schema.title : "no title set"}`,
      `Reason: ${reason}`,
    ].join("\n");
  }
}
