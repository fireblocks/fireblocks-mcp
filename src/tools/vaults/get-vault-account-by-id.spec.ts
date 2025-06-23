import { getVaultAccountByIdTool } from './get-vault-account-by-id';

// Mock the fireblocks client
jest.mock('../../fireblocks-client', () => ({
  fireblocksClient: {
    getVaultAccountById: jest.fn(),
  },
}));

import { fireblocksClient } from '../../fireblocks-client';

describe('getVaultAccountByIdTool', () => {
  const mockFireblocksClient = fireblocksClient as jest.Mocked<typeof fireblocksClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have correct tool properties', () => {
    expect(getVaultAccountByIdTool.name).toBe('get_vault_account_by_id');
    expect(getVaultAccountByIdTool.description).toBe('Get a specific vault account by its ID');
    expect(getVaultAccountByIdTool.schema).toBeDefined();
    expect(getVaultAccountByIdTool.handler).toBeDefined();
  });

  it('should call fireblocksClient.getVaultAccountById with correct parameters', async () => {
    const mockVaultAccount = {
      id: '1',
      name: 'Main Account',
      hiddenOnUI: false,
      assets: [
        {
          id: 'ETH',
          total: '1.0',
          balance: '1.0',
          available: '1.0',
          pending: '0',
          staked: '0',
          frozen: '0',
          lockedAmount: '0',
        },
      ],
      customerRefId: null,
      autoFuel: false,
    } as any;

    mockFireblocksClient.getVaultAccountById.mockResolvedValue(mockVaultAccount);

    const result = await getVaultAccountByIdTool.handler({ vaultAccountId: '1' });

    expect(mockFireblocksClient.getVaultAccountById).toHaveBeenCalledTimes(1);
    expect(mockFireblocksClient.getVaultAccountById).toHaveBeenCalledWith('1');
    expect(result).toEqual(mockVaultAccount);
  });

  it('should handle errors from fireblocks client', async () => {
    const error = new Error('Vault account not found');
    mockFireblocksClient.getVaultAccountById.mockRejectedValue(error);

    await expect(getVaultAccountByIdTool.handler({ vaultAccountId: 'invalid' })).rejects.toThrow(
      'Vault account not found',
    );
  });

  it('should validate required vaultAccountId parameter', () => {
    const schema = getVaultAccountByIdTool.schema;

    // Should fail without vaultAccountId
    expect(() => schema.parse({})).toThrow();

    // Should pass with vaultAccountId
    expect(schema.parse({ vaultAccountId: '1' })).toEqual({ vaultAccountId: '1' });
  });
});
