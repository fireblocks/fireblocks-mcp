import { ZodSchema } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';

export function convertZodToJsonSchema(zodSchema: ZodSchema): any {
  return zodToJsonSchema(zodSchema, {
    target: 'jsonSchema7',
    definitions: {},
  });
}
