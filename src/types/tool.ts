import { ZodSchema } from 'zod';

export interface Tool<TInput = any, TOutput = any> {
  name: string;
  description: string;
  schema: ZodSchema;
  isWriteOperation?: boolean;
  handler: (args: TInput) => Promise<TOutput>;
}
