import { fireblocksClient } from '../../fireblocks-client';
import { getVaultBalanceByAssetTool } from './get-vault-balance-by-asset';

// Mock the fireblocks client
jest.mock('../../fireblocks-client', () => ({
  fireblocksClient: {
    getVaultBalanceByAsset: jest.fn(),
  },
}));

const mockedFireblocksClient = fireblocksClient as jest.Mocked<typeof fireblocksClient>;

describe('getVaultBalanceByAssetTool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('tool configuration', () => {
    it('should have correct name', () => {
      expect(getVaultBalanceByAssetTool.name).toBe('get_vault_balance_by_asset');
    });

    it('should have correct description', () => {
      expect(getVaultBalanceByAssetTool.description).toBe(
        'Get the vault balance summary for an asset',
      );
    });

    it('should have a schema', () => {
      expect(getVaultBalanceByAssetTool.schema).toBeDefined();
    });

    it('should have a handler function', () => {
      expect(typeof getVaultBalanceByAssetTool.handler).toBe('function');
    });
  });

  describe('schema validation', () => {
    it('should validate schema correctly', () => {
      const validArgs = { assetId: 'BTC' };
      const result = getVaultBalanceByAssetTool.schema.safeParse(validArgs);
      expect(result.success).toBe(true);
    });

    it('should reject invalid schema', () => {
      const invalidArgs = { invalidField: 'value' };
      const result = getVaultBalanceByAssetTool.schema.safeParse(invalidArgs);
      expect(result.success).toBe(false);
    });

    it('should reject missing required field', () => {
      const invalidArgs = {};
      const result = getVaultBalanceByAssetTool.schema.safeParse(invalidArgs);
      expect(result.success).toBe(false);
    });

    it('should reject extra properties', () => {
      const result = getVaultBalanceByAssetTool.schema.safeParse({
        assetId: 'BTC',
        invalidProp: 'value',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('handler execution', () => {
    const mockVaultAsset = {
      id: 'BTC',
      total: '2.5',
      available: '2.3',
      pending: '0.2',
      frozen: '0',
      lockedAmount: '0',
      blockHeight: '800000',
      blockHash: 'block-hash-123',
    };

    it('should successfully get vault balance by asset', async () => {
      mockedFireblocksClient.getVaultBalanceByAsset.mockResolvedValue(mockVaultAsset);

      const result = await getVaultBalanceByAssetTool.handler({ assetId: 'BTC' });

      expect(mockedFireblocksClient.getVaultBalanceByAsset).toHaveBeenCalledWith('BTC');
      expect(result).toEqual(mockVaultAsset);
    });

    it('should handle different asset IDs', async () => {
      const ethAsset = { ...mockVaultAsset, id: 'ETH' };
      mockedFireblocksClient.getVaultBalanceByAsset.mockResolvedValue(ethAsset);

      const result = await getVaultBalanceByAssetTool.handler({ assetId: 'ETH' });

      expect(mockedFireblocksClient.getVaultBalanceByAsset).toHaveBeenCalledWith('ETH');
      expect(result).toEqual(ethAsset);
    });
  });
});
