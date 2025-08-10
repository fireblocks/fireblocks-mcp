import { z } from 'zod';
import { fireblocksClient, GetTransactionsRequest } from '../../fireblocks-client';
import { Tool } from '../../types';

const schema = z
  .object({
    before: z
      .string()
      .optional()
      .describe(
        'Unix timestamp in milliseconds. Returns only transactions created before the specified date',
      ),
    after: z
      .string()
      .optional()
      .describe(
        'Unix timestamp in milliseconds. Returns only transactions created after the specified date',
      ),
    status: z.string().optional().describe('Filter by transaction status'),
    orderBy: z
      .enum(['createdAt', 'lastUpdated'])
      .optional()
      .describe('The field to order the results by'),
    sort: z.enum(['ASC', 'DESC']).optional().describe('The direction to order the results by'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .default(50)
      .optional()
      .describe(
        'Limits the number of results. If not provided, a limit of 50 will be used. The maximum allowed limit is 200',
      ),
    sourceType: z
      .enum([
        'VAULT_ACCOUNT',
        'EXCHANGE_ACCOUNT',
        'INTERNAL_WALLET',
        'EXTERNAL_WALLET',
        'CONTRACT',
        'FIAT_ACCOUNT',
        'NETWORK_CONNECTION',
        'COMPOUND',
        'UNKNOWN',
        'GAS_STATION',
        'END_USER_WALLET',
      ])
      .optional()
      .describe('The source type of the transaction'),
    sourceId: z.string().optional().describe('The source ID of the transaction'),
    destType: z
      .enum([
        'VAULT_ACCOUNT',
        'EXCHANGE_ACCOUNT',
        'INTERNAL_WALLET',
        'EXTERNAL_WALLET',
        'CONTRACT',
        'FIAT_ACCOUNT',
        'NETWORK_CONNECTION',
        'COMPOUND',
        'ONE_TIME_ADDRESS',
        'END_USER_WALLET',
      ])
      .optional()
      .describe('The destination type of the transaction'),
    destId: z.string().optional().describe('The destination ID of the transaction'),
    assets: z.string().optional().describe('A list of assets to filter by, separated by commas'),
    txHash: z.string().optional().describe('Returns only results with a specified txHash'),
    sourceWalletId: z
      .string()
      .optional()
      .describe('Returns only results where the source is a specific end user wallet'),
    destWalletId: z
      .string()
      .optional()
      .describe('Returns only results where the destination is a specific end user wallet'),
  })
  .strict();

type GetTransactionsArgs = z.infer<typeof schema>;

export const getTransactionsTool: Tool<GetTransactionsArgs> = {
  name: 'get_transactions',
  description: 'Get Fireblocks transactions with optional filtering',
  schema,
  handler: async (args: GetTransactionsArgs) => {
    const transactions = await fireblocksClient.getTransactions(args as GetTransactionsRequest);

    const result = {
      success: true,
      count: transactions.length,
      transactions,
    };

    return result;
  },
};
