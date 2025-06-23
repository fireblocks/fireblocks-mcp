import { z } from 'zod';
import { fireblocksClient, ListBlockchainsResponse } from '../../fireblocks-client';
import { Tool } from '../../types';

const schema = z.object({}).strict();

type GetBlockchainsArgs = z.infer<typeof schema>;

export const getBlockchainsTool: Tool<GetBlockchainsArgs, ListBlockchainsResponse> = {
  name: 'get_blockchains',
  description: 'Get all blockchains supported by Fireblocks',
  schema,
  handler: async (): Promise<ListBlockchainsResponse> => {
    const blockchains = await fireblocksClient.getBlockchains();
    return blockchains;
  },
};
