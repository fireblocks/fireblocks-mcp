import { z } from 'zod';
import { fireblocksClient, PolicyAndValidationResponse } from '../../fireblocks-client';
import { Tool } from '../../types';

const schema = z.object({}).strict();

type GetActivePolicyArgs = z.infer<typeof schema>;

export const getActivePolicyTool: Tool<GetActivePolicyArgs, PolicyAndValidationResponse> = {
  name: 'get_active_policy',
  description:
    'Get the active policy and its validation. Note: This endpoint is currently in beta and might be subject to changes.',
  schema,
  handler: async (): Promise<PolicyAndValidationResponse> => {
    const policy = await fireblocksClient.getActivePolicy();
    return policy;
  },
};
