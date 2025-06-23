import { getBlockchainAssetTool } from './get-blockchain-asset';

// Mock the fireblocks client
jest.mock('../../fireblocks-client', () => ({
  fireblocksClient: {
    getBlockchainAsset: jest.fn(),
  },
}));

import { fireblocksClient } from '../../fireblocks-client';

describe('getBlockchainAssetTool', () => {
  const mockFireblocksClient = fireblocksClient as jest.Mocked<typeof fireblocksClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have correct tool properties', () => {
    expect(getBlockchainAssetTool.name).toBe('get_blockchain_asset');
    expect(getBlockchainAssetTool.description).toBe(
      'Get a specific blockchain asset by ID or legacyId',
    );
    expect(getBlockchainAssetTool.schema).toBeDefined();
    expect(getBlockchainAssetTool.handler).toBeDefined();
  });

  it('should call fireblocksClient.getBlockchainAsset with correct parameters', async () => {
    const mockAsset = {
      id: 'ETH',
      name: 'Ethereum',
      type: 'BASE_ASSET',
      contractAddress: null,
      nativeAsset: 'ETH',
      decimals: 18,
    } as any;

    mockFireblocksClient.getBlockchainAsset.mockResolvedValue(mockAsset);

    const result = await getBlockchainAssetTool.handler({ id: 'ETH' });

    expect(mockFireblocksClient.getBlockchainAsset).toHaveBeenCalledTimes(1);
    expect(mockFireblocksClient.getBlockchainAsset).toHaveBeenCalledWith('ETH');
    expect(result).toEqual(mockAsset);
  });

  it('should handle errors from fireblocks client', async () => {
    const error = new Error('Asset not found');
    mockFireblocksClient.getBlockchainAsset.mockRejectedValue(error);

    await expect(getBlockchainAssetTool.handler({ id: 'INVALID' })).rejects.toThrow(
      'Asset not found',
    );
  });

  it('should validate required id parameter', () => {
    const schema = getBlockchainAssetTool.schema;

    // Should fail without id
    expect(() => schema.parse({})).toThrow();

    // Should pass with id
    expect(schema.parse({ id: 'ETH' })).toEqual({ id: 'ETH' });
  });
});
