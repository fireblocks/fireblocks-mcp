import { fireblocksClient } from '../../fireblocks-client';
import { getVaultAssetsTool } from './get-vault-assets';

// Mock the fireblocks client
jest.mock('../../fireblocks-client', () => ({
  fireblocksClient: {
    getVaultAssets: jest.fn(),
  },
}));

const mockedFireblocksClient = fireblocksClient as jest.Mocked<typeof fireblocksClient>;

describe('getVaultAssetsTool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('tool configuration', () => {
    it('should have correct name', () => {
      expect(getVaultAssetsTool.name).toBe('get_vault_assets');
    });

    it('should have correct description', () => {
      expect(getVaultAssetsTool.description).toBe('Get asset balance for chosen assets');
    });

    it('should have a schema', () => {
      expect(getVaultAssetsTool.schema).toBeDefined();
    });

    it('should have a handler function', () => {
      expect(typeof getVaultAssetsTool.handler).toBe('function');
    });
  });

  describe('schema validation', () => {
    it('should validate schema with no parameters', () => {
      const validArgs = {};
      const result = getVaultAssetsTool.schema.safeParse(validArgs);
      expect(result.success).toBe(true);
    });

    it('should validate schema with accountNamePrefix', () => {
      const validArgs = { accountNamePrefix: 'test' };
      const result = getVaultAssetsTool.schema.safeParse(validArgs);
      expect(result.success).toBe(true);
    });

    it('should validate schema with accountNameSuffix', () => {
      const validArgs = { accountNameSuffix: 'test' };
      const result = getVaultAssetsTool.schema.safeParse(validArgs);
      expect(result.success).toBe(true);
    });

    it('should validate schema with both parameters', () => {
      const validArgs = {
        accountNamePrefix: 'prefix',
        accountNameSuffix: 'suffix',
      };
      const result = getVaultAssetsTool.schema.safeParse(validArgs);
      expect(result.success).toBe(true);
    });

    it('should reject invalid schema with extra properties', () => {
      const invalidArgs = {
        accountNamePrefix: 'test',
        invalidField: 'value',
      };
      const result = getVaultAssetsTool.schema.safeParse(invalidArgs);
      expect(result.success).toBe(false);
    });

    it('should reject invalid parameter types', () => {
      const invalidArgs = { accountNamePrefix: 123 };
      const result = getVaultAssetsTool.schema.safeParse(invalidArgs);
      expect(result.success).toBe(false);
    });
  });

  describe('handler execution', () => {
    const mockVaultAssets = [
      {
        id: 'BTC',
        total: '2.5',
        available: '2.3',
        pending: '0.2',
        frozen: '0',
        lockedAmount: '0',
        blockHeight: '800000',
        blockHash: 'block-hash-123',
      },
      {
        id: 'ETH',
        total: '10.0',
        available: '9.8',
        pending: '0.2',
        frozen: '0',
        lockedAmount: '0',
        blockHeight: '18000000',
        blockHash: 'eth-block-hash-456',
      },
    ];

    it('should successfully get vault assets with no filters', async () => {
      mockedFireblocksClient.getVaultAssets.mockResolvedValue(mockVaultAssets);

      const result = await getVaultAssetsTool.handler({});

      expect(mockedFireblocksClient.getVaultAssets).toHaveBeenCalledWith({});
      expect(result).toEqual({
        count: 2,
        vaultAssets: mockVaultAssets,
      });
    });

    it('should successfully get vault assets with accountNamePrefix', async () => {
      mockedFireblocksClient.getVaultAssets.mockResolvedValue(mockVaultAssets);

      const result = await getVaultAssetsTool.handler({ accountNamePrefix: 'test' });

      expect(mockedFireblocksClient.getVaultAssets).toHaveBeenCalledWith({
        accountNamePrefix: 'test',
      });
      expect(result).toEqual({
        count: 2,
        vaultAssets: mockVaultAssets,
      });
    });

    it('should successfully get vault assets with accountNameSuffix', async () => {
      mockedFireblocksClient.getVaultAssets.mockResolvedValue(mockVaultAssets);

      const result = await getVaultAssetsTool.handler({ accountNameSuffix: 'account' });

      expect(mockedFireblocksClient.getVaultAssets).toHaveBeenCalledWith({
        accountNameSuffix: 'account',
      });
      expect(result).toEqual({
        count: 2,
        vaultAssets: mockVaultAssets,
      });
    });

    it('should successfully get vault assets with both filters', async () => {
      mockedFireblocksClient.getVaultAssets.mockResolvedValue(mockVaultAssets);

      const result = await getVaultAssetsTool.handler({
        accountNamePrefix: 'prefix',
        accountNameSuffix: 'suffix',
      });

      expect(mockedFireblocksClient.getVaultAssets).toHaveBeenCalledWith({
        accountNamePrefix: 'prefix',
        accountNameSuffix: 'suffix',
      });
      expect(result).toEqual({
        count: 2,
        vaultAssets: mockVaultAssets,
      });
    });

    it('should handle empty result', async () => {
      mockedFireblocksClient.getVaultAssets.mockResolvedValue([]);

      const result = await getVaultAssetsTool.handler({});

      expect(mockedFireblocksClient.getVaultAssets).toHaveBeenCalledWith({});
      expect(result).toEqual({
        count: 0,
        vaultAssets: [],
      });
    });

    it('should handle null result', async () => {
      mockedFireblocksClient.getVaultAssets.mockResolvedValue(null as any);

      const result = await getVaultAssetsTool.handler({});

      expect(mockedFireblocksClient.getVaultAssets).toHaveBeenCalledWith({});
      expect(result).toEqual({
        count: 0,
        vaultAssets: [],
      });
    });

    it('should handle undefined result', async () => {
      mockedFireblocksClient.getVaultAssets.mockResolvedValue(undefined as any);

      const result = await getVaultAssetsTool.handler({});

      expect(mockedFireblocksClient.getVaultAssets).toHaveBeenCalledWith({});
      expect(result).toEqual({
        count: 0,
        vaultAssets: [],
      });
    });
  });
});
