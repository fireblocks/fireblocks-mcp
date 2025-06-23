import { z } from 'zod';
import { fireblocksClient, VaultAccount } from '../../fireblocks-client';
import { Tool } from '../../types';

const schema = z
  .object({
    vaultAccountId: z.string().describe('The vault account ID'),
  })
  .strict();

type GetVaultAccountByIdArgs = z.infer<typeof schema>;

export const getVaultAccountByIdTool: Tool<GetVaultAccountByIdArgs, VaultAccount> = {
  name: 'get_vault_account_by_id',
  description: 'Get a specific vault account by its ID',
  schema,
  handler: async (args: GetVaultAccountByIdArgs): Promise<VaultAccount> => {
    const vaultAccount = await fireblocksClient.getVaultAccountById(args.vaultAccountId);
    return vaultAccount;
  },
};
