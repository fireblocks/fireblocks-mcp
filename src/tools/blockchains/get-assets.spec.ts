import { getAssetsTool } from './get-assets';

// Mock the fireblocks client
jest.mock('../../fireblocks-client', () => ({
  fireblocksClient: {
    getAssets: jest.fn(),
  },
}));

import { fireblocksClient } from '../../fireblocks-client';

describe('getAssetsTool', () => {
  const mockFireblocksClient = fireblocksClient as jest.Mocked<typeof fireblocksClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have correct tool properties', () => {
    expect(getAssetsTool.name).toBe('get_assets');
    expect(getAssetsTool.description).toBe(
      'Get assets supported by Fireblocks with filtering options',
    );
    expect(getAssetsTool.schema).toBeDefined();
    expect(getAssetsTool.handler).toBeDefined();
  });

  it('should call fireblocksClient.getAssets and return the result', async () => {
    const mockAssets = {
      data: [
        {
          id: '9f9f7062-df90-4fc0-8697-96685184358d',
          legacyId: 'USDT_ERC20',
          blockchainId: 'e85208ff-3b15-44e9-af14-0ed0280b2a15',
          displayName: 'Tether USD',
          displaySymbol: 'USDT',
          assetClass: 'FT',
          onchain: {
            symbol: 'USDT',
            name: 'Tether USD',
            address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            decimals: 6,
            standards: ['ERC20'],
          },
          metadata: {
            scope: 'GLOBAL',
            deprecated: false,
          },
        },
        {
          id: '8a8a8062-df90-4fc0-8697-96685184358e',
          legacyId: 'BTC',
          blockchainId: 'f85208ff-3b15-44e9-af14-0ed0280b2a16',
          displayName: 'Bitcoin',
          displaySymbol: 'BTC',
          assetClass: 'NATIVE',
          onchain: {
            symbol: 'BTC',
            name: 'Bitcoin',
            decimals: 8,
            standards: [],
          },
          metadata: {
            scope: 'GLOBAL',
            deprecated: false,
          },
        },
      ],
      next: null,
    } as any;

    mockFireblocksClient.getAssets.mockResolvedValue(mockAssets);

    const result = await getAssetsTool.handler({});

    expect(mockFireblocksClient.getAssets).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockAssets);
  });

  it('should handle filtering parameters', async () => {
    const mockAssets = {
      data: [],
      next: null,
    } as any;

    mockFireblocksClient.getAssets.mockResolvedValue(mockAssets);

    const filterArgs = {
      blockchainId: 'e85208ff-3b15-44e9-af14-0ed0280b2a15',
      assetClass: 'FT' as const,
      symbol: 'USDT',
      scope: 'GLOBAL' as const,
      deprecated: false,
      pageSize: 100,
    };

    await getAssetsTool.handler(filterArgs);

    expect(mockFireblocksClient.getAssets).toHaveBeenCalledWith(filterArgs);
  });

  it('should handle pagination parameters', async () => {
    const mockAssets = {
      data: [],
      next: 'next-cursor',
    } as any;

    mockFireblocksClient.getAssets.mockResolvedValue(mockAssets);

    const paginationArgs = {
      pageCursor: 'some-cursor',
      pageSize: 200,
    };

    await getAssetsTool.handler(paginationArgs);

    expect(mockFireblocksClient.getAssets).toHaveBeenCalledWith(paginationArgs);
  });

  it('should handle array of asset IDs', async () => {
    const mockAssets = {
      data: [],
      next: null,
    } as any;

    mockFireblocksClient.getAssets.mockResolvedValue(mockAssets);

    const idsArgs = {
      ids: ['9f9f7062-df90-4fc0-8697-96685184358d', '8a8a8062-df90-4fc0-8697-96685184358e'],
    };

    await getAssetsTool.handler(idsArgs);

    expect(mockFireblocksClient.getAssets).toHaveBeenCalledWith(idsArgs);
  });

  it('should handle errors from fireblocks client', async () => {
    const error = new Error('Fireblocks API error');
    mockFireblocksClient.getAssets.mockRejectedValue(error);

    await expect(getAssetsTool.handler({})).rejects.toThrow('Fireblocks API error');
  });

  describe('schema validation', () => {
    it('should validate schema with no parameters', () => {
      const validArgs = {};
      const result = getAssetsTool.schema.safeParse(validArgs);
      expect(result.success).toBe(true);
    });

    it('should validate schema with all valid parameters', () => {
      const validArgs = {
        blockchainId: 'e85208ff-3b15-44e9-af14-0ed0280b2a15',
        assetClass: 'FT',
        symbol: 'USDT',
        scope: 'GLOBAL',
        deprecated: false,
        ids: ['id1', 'id2'],
        pageCursor: 'cursor',
        pageSize: 200,
      };
      const result = getAssetsTool.schema.safeParse(validArgs);
      expect(result.success).toBe(true);
    });

    it('should reject invalid assetClass', () => {
      const invalidArgs = { assetClass: 'INVALID_CLASS' };
      const result = getAssetsTool.schema.safeParse(invalidArgs);
      expect(result.success).toBe(false);
    });

    it('should reject invalid scope', () => {
      const invalidArgs = { scope: 'INVALID_SCOPE' };
      const result = getAssetsTool.schema.safeParse(invalidArgs);
      expect(result.success).toBe(false);
    });

    it('should reject pageSize below minimum', () => {
      const invalidArgs = { pageSize: 50 };
      const result = getAssetsTool.schema.safeParse(invalidArgs);
      expect(result.success).toBe(false);
    });

    it('should reject pageSize above maximum', () => {
      const invalidArgs = { pageSize: 1500 };
      const result = getAssetsTool.schema.safeParse(invalidArgs);
      expect(result.success).toBe(false);
    });

    it('should reject too many IDs', () => {
      const invalidArgs = { ids: new Array(101).fill('id') };
      const result = getAssetsTool.schema.safeParse(invalidArgs);
      expect(result.success).toBe(false);
    });

    it('should reject extra properties', () => {
      const invalidArgs = { invalidField: 'value' };
      const result = getAssetsTool.schema.safeParse(invalidArgs);
      expect(result.success).toBe(false);
    });
  });
});
