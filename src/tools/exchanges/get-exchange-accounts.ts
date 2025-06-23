import { z } from 'zod';
import {
  fireblocksClient,
  GetExchangeAccountsRequest,
  GetExchangeAccountsResponse,
} from '../../fireblocks-client';
import { Tool } from '../../types';

const schema = z
  .object({
    limit: z
      .number()
      .int()
      .min(1)
      .max(5)
      .optional()
      .default(3)
      .describe('Number of exchanges per page (min: 1, max: 5, default: 3)'),
    before: z.string().optional().describe('Pagination cursor for results before this point'),
    after: z.string().optional().describe('Pagination cursor for results after this point'),
  })
  .strict();

type GetExchangeAccountsArgs = z.infer<typeof schema>;

export const getExchangeAccountsTool: Tool<GetExchangeAccountsArgs, GetExchangeAccountsResponse> = {
  name: 'get_exchange_accounts',
  description: 'Get exchange accounts with pagination support',
  schema,
  handler: async (args: GetExchangeAccountsArgs): Promise<GetExchangeAccountsResponse> => {
    const exchangeAccounts = await fireblocksClient.getExchangeAccounts(
      args as GetExchangeAccountsRequest,
    );
    return exchangeAccounts;
  },
};
