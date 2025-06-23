import { getBlockchainsTool } from './get-blockchains';

// Mock the fireblocks client
jest.mock('../../fireblocks-client', () => ({
  fireblocksClient: {
    getBlockchains: jest.fn(),
  },
}));

import { fireblocksClient } from '../../fireblocks-client';

describe('getBlockchainsTool', () => {
  const mockFireblocksClient = fireblocksClient as jest.Mocked<typeof fireblocksClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have correct tool properties', () => {
    expect(getBlockchainsTool.name).toBe('get_blockchains');
    expect(getBlockchainsTool.description).toBe('Get all blockchains supported by Fireblocks');
    expect(getBlockchainsTool.schema).toBeDefined();
    expect(getBlockchainsTool.handler).toBeDefined();
  });

  it('should call fireblocksClient.getBlockchains and return the result', async () => {
    const mockBlockchains = {
      data: [
        {
          id: 'ETH',
          displayName: 'Ethereum',
          nativeAsset: 'ETH',
          isTestnet: false,
        },
        {
          id: 'BTC',
          displayName: 'Bitcoin',
          nativeAsset: 'BTC',
          isTestnet: false,
        },
      ],
      paging: {
        before: null,
        after: null,
      },
    } as any;

    mockFireblocksClient.getBlockchains.mockResolvedValue(mockBlockchains);

    const result = await getBlockchainsTool.handler({});

    expect(mockFireblocksClient.getBlockchains).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockBlockchains);
  });

  it('should handle errors from fireblocks client', async () => {
    const error = new Error('Fireblocks API error');
    mockFireblocksClient.getBlockchains.mockRejectedValue(error);

    await expect(getBlockchainsTool.handler({})).rejects.toThrow('Fireblocks API error');
  });
});
