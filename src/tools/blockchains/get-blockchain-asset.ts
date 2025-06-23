import { z } from 'zod';
import { Asset, fireblocksClient } from '../../fireblocks-client';
import { Tool } from '../../types';

const schema = z
  .object({
    id: z.string().describe('The ID or legacyId of the blockchain asset'),
  })
  .strict();

type GetBlockchainAssetArgs = z.infer<typeof schema>;

export const getBlockchainAssetTool: Tool<GetBlockchainAssetArgs, Asset> = {
  name: 'get_blockchain_asset',
  description: 'Get a specific blockchain asset by ID or legacyId',
  schema,
  handler: async (args: GetBlockchainAssetArgs): Promise<Asset> => {
    const asset = await fireblocksClient.getBlockchainAsset(args.id);
    return asset;
  },
};
