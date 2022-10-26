import { JSONSchemaObject } from "@json-schema-tools/meta-schema";
import ValidationError from "../validation-error";

export class StringValidationError extends ValidationError {
  public name = "StringValidationError";

  constructor(schema: JSONSchemaObject, data: any, message: string) {
    const msg = [
      `Invalid string value`,
      message,
    ];
    super(schema, data, msg.join("\n"));
  }
}

export class StringValidationErrorBadType extends StringValidationError {
  public name = "StringValidationErrorBadType";

  constructor(schema: JSONSchemaObject, data: any) {
    super(schema, data, [
      "Value must be of type 'string'",
      `Received type: ${typeof data}`,
    ].join('\n'));
  }
}

export class StringValidationErrorMaxLength extends StringValidationError {
  public name = "StringValidationErrorMaxLength";

  constructor(schema: JSONSchemaObject, data: string) {
    super(schema, data, [
      `Value must have a length less than or equal to ${schema.maxLength}`,
      `Received values length: ${data.length}`,
    ].join('\n'));
  }
}

export class StringValidationErrorMinLength extends StringValidationError {
  public name = "StringValidationErrorMinLength";

  constructor(schema: JSONSchemaObject, data: string) {
    super(schema, data, [
      `Value must have a length greater than or equal to ${schema.minLength}`,
      `Received values length: ${data.length}`,
    ].join('\n'));
  }
}

export class StringValidationErrorPattern extends StringValidationError {
  public name = "StringValidationErrorPattern";

  constructor(schema: JSONSchemaObject, data: string) {
    super(schema, data, `Value must match pattern: ${schema.pattern}`);
  }
}

export class StringValidationErrorConst extends StringValidationError {
  public name = "StringValidationErrorConst";

  constructor(schema: JSONSchemaObject, data: string) {
    super(schema, data, `Value must be equal to: ${schema.const}`);
  }
}

export class StringValidationErrorEnum extends StringValidationError {
  public name = "StringValidationErrorEnum";

  constructor(schema: JSONSchemaObject, data: string) {
    super(
      schema,
      data,
      `Value must be equal to one of: ${(schema as any).enum.join(", ")}`
    );
  }
}

export default (schema: JSONSchemaObject, d: any): true | StringValidationError => {
  if (typeof d !== "string") {
    return new StringValidationErrorBadType(schema, d);
  }

  if (schema.maxLength) {
    if (d.length > schema.maxLength) {
      return new StringValidationErrorMaxLength(schema, d);
    }
  }

  if (schema.minLength) {
    if (d.length <= schema.minLength) {
      return new StringValidationErrorMinLength(schema, d);
    }
  }

  if (schema.pattern) {
    const reg = new RegExp(schema.pattern);
    if (reg.test(d) === false) {
      return new StringValidationErrorPattern(schema, d)
    }
  }

  if (schema.const) {
    if (d !== schema.const) {
      return new StringValidationErrorConst(schema, d);
    }
  }

  if (schema.enum) {
    if (schema.enum.indexOf(d) === -1) {
      return new StringValidationErrorEnum(schema, d);
    }
  }

  return true;
}
