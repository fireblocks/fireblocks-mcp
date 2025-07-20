import { getInternalWalletsTool } from './get-internal-wallets';

// Mock the fireblocks client
jest.mock('../../fireblocks-client', () => ({
  fireblocksClient: {
    getInternalWallets: jest.fn(),
  },
}));

import { fireblocksClient } from '../../fireblocks-client';

describe('getInternalWalletsTool', () => {
  const mockFireblocksClient = fireblocksClient as jest.Mocked<typeof fireblocksClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have correct tool properties', () => {
    expect(getInternalWalletsTool.name).toBe('get_internal_wallets');
    expect(getInternalWalletsTool.description).toBe('Get internal wallets under the workspace');
    expect(getInternalWalletsTool.schema).toBeDefined();
    expect(getInternalWalletsTool.handler).toBeDefined();
  });

  it('should call fireblocksClient.getInternalWallets and return the result', async () => {
    const mockInternalWallets = [
      {
        id: 'wallet-1',
        name: 'Test Internal Wallet 1',
        customerRefId: 'ref-1',
        assets: [],
      },
      {
        id: 'wallet-2',
        name: 'Test Internal Wallet 2',
        customerRefId: 'ref-2',
        assets: [],
      },
    ] as any;

    mockFireblocksClient.getInternalWallets.mockResolvedValue(mockInternalWallets);

    const result = await getInternalWalletsTool.handler({});

    expect(mockFireblocksClient.getInternalWallets).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockInternalWallets);
  });

  it('should handle errors from fireblocks client', async () => {
    const error = new Error('Fireblocks API error');
    mockFireblocksClient.getInternalWallets.mockRejectedValue(error);

    await expect(getInternalWalletsTool.handler({})).rejects.toThrow('Fireblocks API error');
  });
});
