import { z } from 'zod';
import { fireblocksClient, GetInternalWalletsResponse } from '../../fireblocks-client';
import { Tool } from '../../types';

const schema = z.object({}).strict();

type GetInternalWalletsArgs = z.infer<typeof schema>;

export const getInternalWalletsTool: Tool<GetInternalWalletsArgs, GetInternalWalletsResponse> = {
  name: 'get_internal_wallets',
  description: 'Get internal wallets under the workspace',
  schema,
  handler: async (): Promise<GetInternalWalletsResponse> => {
    const internalWallets = await fireblocksClient.getInternalWallets();
    return internalWallets;
  },
};
