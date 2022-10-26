import validator from "./";
import dereferencer from "@json-schema-tools/dereferencer";
import { ValidationErrors } from "./validation-error";
const testSuite = require('@json-schema-org/tests');

describe("validating against test cases from JSON-Schema-Test-Suite", () => {
  const tss = testSuite.loadSync();

  beforeAll(async () => {
    for (const testSuite of tss) {
      for (const testCase of testSuite) {
        const dereffer = new dereferencer(testCase.schema);
        testCase.schema = await dereffer.resolve();
      }
    }
  });

  tss.forEach((ts: any) => {
    describe(ts.name, () => {
      ts.schemas.forEach((t: any) => {
        describe(t.description, () => {
          t.tests.forEach((testCase: any) => {
            it(`testCase.description ${JSON.stringify(t.schema)} vs. ${JSON.stringify(testCase.data)}`, () => {
              const result: any = validator(t.schema, testCase.data);
              if (testCase.valid) {
                expect(result).toBe(true);
              } else {
                expect(result).not.toBe(true);
                expect(result).toBeInstanceOf(ValidationErrors);
              }
            });
          });
        });
      });
    });
  });
});
