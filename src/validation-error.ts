import { JSONSchema } from "@json-schema-tools/meta-schema";
import { StringValidationError } from "./base-validators/string";
import { BooleanValidationError } from "./base-validators/boolean";
import { NumberValidationError } from "./base-validators/number";
import { IntegerValidationError } from "./base-validators/integer";
import { ObjectValidationError } from "./base-validators/object";

export type tValidationError = StringValidationError | BooleanValidationError | NumberValidationError | IntegerValidationError | ObjectValidationError;

export class ValidationErrors implements Error {
  public name = "ValidationErrors";
  public message: string;

  constructor(public errors: ValidationError[]) {
    const msg = [
      "JSONSChema Validation Errors"
    ];

    errors.forEach((err) => {
      msg.push("");
      msg.push("__________________________");
      msg.push(`**${err.name}**`);
      msg.push("");
      msg.push(`${err.message}`);
      msg.push("__________________________");
    });
    this.message = msg.join("\n");
  }
}

export default class ValidationError implements Error {
  public name = "ValidationError";
  public message: string;

  constructor(schema: JSONSchema, data: any, message: string) {
    let msg = [];

    if (schema === true || schema === false) {
      if (schema === false) {
        msg.push("Boolean schema 'false' is always invalid");
      }
    } else {
      if (schema.title) {
        msg.push(`Validation Error for schema titled: "${schema.title}"`);
      } else {
        msg.push(`Validation Error`);
      }
    }
    msg.push(message);
    msg.push(`Received value: ${data}`);
    this.message = msg.join("\n");
  }
}
