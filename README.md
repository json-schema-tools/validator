# JSON Schema Validator

This package implements a JSON Schema validator.

## Features

 - dead simple
 - faster than sonic
 - completely synchronous
 - circular reference detection & handling
 - errors if it finds any $refs - use the [dereferencer](https://github.com/json-schema-tools/dereferencer) before using the validator.

## Getting Started

```sh
npm install @json-schema-tools/validator
```

```typescript
import Validator, { ValidatorErrors, ReferenceError } from "@json-schema-tools/validator"

const mySchema = {
  title: "baz",
  type: "object",
  properties: {
    foo: {
      title: "foo",
      type: "array",
      items: { type: "string" }
    },
    bar: {
      title: "bar",
      anyOf: [
        { title: "stringerific", type: "string" },
        { title: "numberoo", type: "number" }
      ]
    }
  }
};

const bazValidator = new Validator(mySchema);

const isValid = bazValidator({ foo: ["hello", "world" ], bar: 1 });

if (isValid instanceof ValidatorErrors) {
    console.error(isValid);
    isValid.errors.forEach((error) => {
        if (error instanceof ReferenceError) { ... }
    });
}
```

### Contributing

How to contribute, build and release are outlined in [CONTRIBUTING.md](CONTRIBUTING.md), [BUILDING.md](BUILDING.md) and [RELEASING.md](RELEASING.md) respectively. Commits in this repository follow the [CONVENTIONAL_COMMITS.md](CONVENTIONAL_COMMITS.md) specification.
