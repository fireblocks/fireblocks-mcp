import { z } from 'zod';
import { fireblocksClient, GetExternalWalletsResponse } from '../../fireblocks-client';
import { Tool } from '../../types';

const schema = z.object({}).strict();

type GetExternalWalletsArgs = z.infer<typeof schema>;

export const getExternalWalletsTool: Tool<GetExternalWalletsArgs, GetExternalWalletsResponse> = {
  name: 'get_external_wallets',
  description: 'Get external wallets under the workspace',
  schema,
  handler: async (): Promise<GetExternalWalletsResponse> => {
    const externalWallets = await fireblocksClient.getExternalWallets();
    return externalWallets;
  },
};
