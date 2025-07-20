import { getExternalWalletsTool } from './get-external-wallets';

// Mock the fireblocks client
jest.mock('../../fireblocks-client', () => ({
  fireblocksClient: {
    getExternalWallets: jest.fn(),
  },
}));

import { fireblocksClient } from '../../fireblocks-client';

describe('getExternalWalletsTool', () => {
  const mockFireblocksClient = fireblocksClient as jest.Mocked<typeof fireblocksClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have correct tool properties', () => {
    expect(getExternalWalletsTool.name).toBe('get_external_wallets');
    expect(getExternalWalletsTool.description).toBe('Get external wallets under the workspace');
    expect(getExternalWalletsTool.schema).toBeDefined();
    expect(getExternalWalletsTool.handler).toBeDefined();
  });

  it('should call fireblocksClient.getExternalWallets and return the result', async () => {
    const mockExternalWallets = [
      {
        id: 'wallet-1',
        name: 'Test External Wallet 1',
        customerRefId: 'ref-1',
        assets: [],
      },
      {
        id: 'wallet-2',
        name: 'Test External Wallet 2',
        customerRefId: 'ref-2',
        assets: [],
      },
    ] as any;

    mockFireblocksClient.getExternalWallets.mockResolvedValue(mockExternalWallets);

    const result = await getExternalWalletsTool.handler({});

    expect(mockFireblocksClient.getExternalWallets).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockExternalWallets);
  });

  it('should handle errors from fireblocks client', async () => {
    const error = new Error('Fireblocks API error');
    mockFireblocksClient.getExternalWallets.mockRejectedValue(error);

    await expect(getExternalWalletsTool.handler({})).rejects.toThrow('Fireblocks API error');
  });
});
