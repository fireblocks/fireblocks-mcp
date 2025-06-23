import { z } from 'zod';
import { fireblocksClient } from '../../fireblocks-client';
import { Tool } from '../../types';

const schema = z
  .object({
    assetId: z.string().describe('The ID of the asset'),
  })
  .strict();

type GetVaultBalanceByAssetArgs = z.infer<typeof schema>;

export const getVaultBalanceByAssetTool: Tool<GetVaultBalanceByAssetArgs> = {
  name: 'get_vault_balance_by_asset',
  description: 'Get the vault balance summary for an asset',
  schema,
  handler: async (args: GetVaultBalanceByAssetArgs) => {
    const vaultAsset = await fireblocksClient.getVaultBalanceByAsset(args.assetId);

    return vaultAsset;
  },
};
