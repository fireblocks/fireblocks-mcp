import { z } from 'zod';
import { fireblocksClient, GetWhitelistIpAddressesRequest } from '../../fireblocks-client';
import { Tool } from '../../types';

const schema = z
  .object({
    userId: z.string().describe('The ID of the API user'),
  })
  .strict();

type GetWhitelistIpAddressesArgs = z.infer<typeof schema>;

export const getWhitelistIpAddressTool: Tool<GetWhitelistIpAddressesArgs> = {
  name: 'get_whitelist_ip_addresses',
  description: 'Get whitelisted IP addresses for a given API user',
  schema,
  handler: async (args: GetWhitelistIpAddressesArgs) => {
    const whitelistIpAddresses = await fireblocksClient.getWhitelistIpAddresses(
      args as GetWhitelistIpAddressesRequest,
    );

    return whitelistIpAddresses;
  },
};
