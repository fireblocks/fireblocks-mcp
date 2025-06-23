import { z } from 'zod';
import { fireblocksClient } from '../../fireblocks-client';
import { Tool } from '../../types';

const schema = z.object({}).strict();

type GetNetworkConnectionsArgs = z.infer<typeof schema>;

export const getNetworkConnectionsTool: Tool<GetNetworkConnectionsArgs> = {
  name: 'get_network_connections',
  description: 'Get a list of network connections',
  schema,
  handler: async () => {
    const networkConnections = await fireblocksClient.getNetworkConnections();

    return networkConnections;
  },
};
