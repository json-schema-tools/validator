import ValidationError from "../validation-error";
import { JSONSchemaObject } from "@json-schema-tools/meta-schema";

export class NumberValidationError extends ValidationError {
  public name = "NumberValidationError";

  constructor(schema: JSONSchemaObject, data: any, message: string) {
    const msg = [
      "Invalid number value",
      message,
    ];

    super(schema, data, msg.join("\n"));
  }
}

export class NumberValidationErrorBadType extends NumberValidationError {
  public name = "NumberValidationErrorBadType";

  constructor(schema: JSONSchemaObject, data: any) {
    super(schema, data, [
      "Value must be of type 'number'",
      `Received type: ${typeof data}`,
    ].join('\n'));
  }
}

export class NumberValidationErrorMultipleOf extends NumberValidationError {
  public name = "NumberValidationErrorMultipleOf";

  constructor(schema: JSONSchemaObject, data: number, remainder: number) {
    super(schema, data, [
      `Value is not a multiple of ${schema.multipleOf}`,
      `remainder: ${remainder}`,
    ].join('\n'));
  }
}

export class NumberValidationErrorMaximum extends NumberValidationError {
  public name = "NumberValidationErrorMaximum";

  constructor(schema: JSONSchemaObject, data: number) {
    const max = schema.maximum as number;
    super(schema, data, [
      `Value must be less than or equal to ${max}`,
      `difference: ${data} - ${max} = ${data - max}`,
    ].join('\n'));
  }
}

export class NumberValidationErrorMinimum extends NumberValidationError {
  public name = "NumberValidationErrorMinimum";

  constructor(schema: JSONSchemaObject, data: number) {
    const min = schema.minimum as number;
    super(schema, data, [
      `Value must be greater than or equal to ${schema.minimum}`,
      `difference: ${min} - ${data} = ${min - data}`,
    ].join('\n'));
  }
}

export class NumberValidationErrorExclusiveMaximum extends NumberValidationError {
  public name = "NumberValidationErrorExclusiveMaximum";

  constructor(schema: JSONSchemaObject, data: number) {
    const max = schema.exclusiveMaximum as number;
    super(schema, data, [
      `Value must be less than ${max}`,
      `difference: ${data} - ${max} = ${data - max}`,
    ].join('\n'));
  }
}

export class NumberValidationErrorExclusiveMinimum extends NumberValidationError {
  public name = "NumberValidationErrorExclusiveMinimum";

  constructor(schema: JSONSchemaObject, data: number) {
    const min = schema.exclusiveMinimum as number;
    super(schema, data, [
      `Value must be greater than ${min}`,
      `difference: ${min} - ${data} = ${min - data}`,
    ].join('\n'));
  }
}

export class NumberValidationErrorConst extends NumberValidationError {
  public name = "NumberValidationErrorConst";

  constructor(schema: JSONSchemaObject, data: number) {
    super(schema, data, `Value must be equal to: ${schema.const}`);
  }
}

export class NumberValidationErrorEnum extends NumberValidationError {
  public name = "NumberValidationErrorEnum";

  constructor(schema: JSONSchemaObject, data: number) {
    super(
      schema,
      data,
      `Value must be equal to one of: ${(schema as any).enum.join(", ")}`
    );
  }
}

export default (schema: JSONSchemaObject, d: any): true | ValidationError => {
  if (typeof d !== "number") {
    return new NumberValidationErrorBadType(schema, d);
  }

  if (schema.multipleOf) {
    const r = d % schema.multipleOf;
    if (r !== 0) {
      return new NumberValidationErrorMultipleOf(schema, d, r);
    }
  }

  if (schema.maximum) {
    if (d > schema.maximum) {
      return new NumberValidationErrorMaximum(schema, d);
    }
  }

  if (schema.exclusiveMaximum) {
    if (d >= schema.exclusiveMaximum) {
      return new NumberValidationErrorExclusiveMaximum(schema, d);
    }
  }

  if (schema.minimum) {
    if (d < schema.minimum) {
      return new NumberValidationErrorMinimum(schema, d);
    }
  }

  if (schema.exclusiveMinimum) {
    if (d <= schema.exclusiveMinimum) {
      return new NumberValidationErrorExclusiveMinimum(schema, d);
    }
  }

  if (schema.const) {
    if (d !== schema.const) {
      return new NumberValidationErrorConst(schema, d);
    }
  }

  if (schema.enum) {
    if (schema.enum.indexOf(d) === -1) {
      return new NumberValidationErrorEnum(schema, d);
    }
  }

  return true;
}
