import { z } from 'zod';
import { fireblocksClient, GetVaultAssetsRequest } from '../../fireblocks-client';
import { Tool } from '../../types';

const schema = z
  .object({
    accountNamePrefix: z.string().optional().describe('Filter vault accounts by name prefix'),
    accountNameSuffix: z.string().optional().describe('Filter vault accounts by name suffix'),
  })
  .strict();

type GetVaultAssetsArgs = z.infer<typeof schema>;

export const getVaultAssetsTool: Tool<GetVaultAssetsArgs> = {
  name: 'get_vault_assets',
  description: 'Get asset balance for chosen assets',
  schema,
  handler: async (args: GetVaultAssetsArgs) => {
    const vaultAssets = await fireblocksClient.getVaultAssets(args as GetVaultAssetsRequest);

    const result = {
      count: vaultAssets?.length || 0,
      vaultAssets: vaultAssets || [],
    };

    return result;
  },
};
