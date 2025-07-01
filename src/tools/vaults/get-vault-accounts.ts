import { z } from 'zod';
import { fireblocksClient, GetVaultAccountsRequest } from '../../fireblocks-client';
import { Tool } from '../../types';

const schema = z
  .object({
    namePrefix: z.string().optional().describe('Filter vault accounts by name prefix'),
    nameSuffix: z.string().optional().describe('Filter vault accounts by name suffix'),
    minAmountThreshold: z
      .number()
      .optional()
      .describe(
        'Specifying minAmountThreshold will filter accounts with balances greater than this value, otherwise, it will return all accounts',
      ),
    assetId: z.string().optional().describe('Filter vault accounts by asset ID'),
    orderBy: z
      .enum(['ASC', 'DESC'])
      .optional()
      .describe('The direction to order the results by. Default is DESC'),
    before: z.string().optional().describe('Pagination cursor for results before this point'),
    after: z.string().optional().describe('Pagination cursor for results after this point'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(200)
      .default(50)
      .optional()
      .describe(
        'Limits the number of results. If not provided, a limit of 50 will be used. The maximum allowed limit is 200',
      ),
  })
  .strict();

type GetVaultAccountsArgs = z.infer<typeof schema>;

export const getVaultAccountsTool: Tool<GetVaultAccountsArgs> = {
  name: 'get_vault_accounts',
  description: 'Get Fireblocks vault accounts with optional filtering',
  schema,
  handler: async (args: GetVaultAccountsArgs) => {
    const vaultAccounts = await fireblocksClient.getVaultAccounts(args as GetVaultAccountsRequest);

    const result = {
      count: vaultAccounts.accounts?.length || 0,
      vaultAccounts: vaultAccounts.accounts || [],
      paging: vaultAccounts.paging,
    };

    return result;
  },
};
