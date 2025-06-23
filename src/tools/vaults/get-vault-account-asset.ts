import { z } from 'zod';
import { fireblocksClient, GetVaultAccountAssetRequest } from '../../fireblocks-client';
import { Tool } from '../../types';

const schema = z
  .object({
    vaultAccountId: z.string().describe('The ID of the vault account to return'),
    assetId: z.string().describe('The ID of the asset'),
  })
  .strict();

type GetVaultAccountAssetArgs = z.infer<typeof schema>;

export const getVaultAccountAssetTool: Tool<GetVaultAccountAssetArgs> = {
  name: 'get_vault_account_asset',
  description: 'Get the asset balance for a specific vault account and asset',
  schema,
  handler: async (args: GetVaultAccountAssetArgs) => {
    const vaultAsset = await fireblocksClient.getVaultAccountAsset(
      args as GetVaultAccountAssetRequest,
    );

    return vaultAsset;
  },
};
