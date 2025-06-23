import { ZodSchema } from 'zod';

export interface Tool<TInput = any, TOutput = any> {
  name: string;
  description: string;
  schema: ZodSchema;
  handler: (args: TInput) => Promise<TOutput>;
}
