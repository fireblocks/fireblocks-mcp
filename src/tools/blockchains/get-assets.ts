import { z } from 'zod';
import { fireblocksClient, ListAssetsRequest, ListAssetsResponse } from '../../fireblocks-client';
import { Tool } from '../../types';

const schema = z
  .object({
    blockchainId: z.string().optional().describe('Blockchain id of the assets'),
    assetClass: z.enum(['NATIVE', 'FT', 'FIAT', 'NFT', 'SFT']).optional().describe('Assets class'),
    symbol: z.string().optional().describe('Assets onchain symbol'),
    scope: z.enum(['GLOBAL', 'LOCAL']).optional().describe('Scope of the assets'),
    deprecated: z.boolean().optional().describe('Are assets deprecated'),
    ids: z.array(z.string()).max(100).optional().describe('A list of asset IDs (max 100)'),
    pageCursor: z.string().optional().describe('Next page cursor to fetch'),
    pageSize: z
      .number()
      .int()
      .min(100)
      .max(1000)
      .default(500)
      .optional()
      .describe('Items per page'),
  })
  .strict();

type GetAssetsArgs = z.infer<typeof schema>;

export const getAssetsTool: Tool<GetAssetsArgs, ListAssetsResponse> = {
  name: 'get_assets',
  description: 'Get assets supported by Fireblocks with filtering options',
  schema,
  handler: async (args: GetAssetsArgs): Promise<ListAssetsResponse> => {
    const assets = await fireblocksClient.getAssets(args as unknown as ListAssetsRequest);
    return assets;
  },
};
