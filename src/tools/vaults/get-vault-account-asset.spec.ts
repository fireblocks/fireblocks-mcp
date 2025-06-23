import { fireblocksClient } from '../../fireblocks-client';
import { getVaultAccountAssetTool } from './get-vault-account-asset';

jest.mock('../../fireblocks-client', () => ({
  fireblocksClient: {
    getVaultAccountAsset: jest.fn(),
  },
}));

const mockedFireblocksClient = fireblocksClient as jest.Mocked<typeof fireblocksClient>;

describe('getVaultAccountAssetTool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get vault account asset with required parameters', async () => {
    const mockVaultAsset = {
      id: 'BTC',
      total: '0.12345678',
      balance: '0.12345678',
      available: '0.12345678',
      pending: '0',
      frozen: '0',
      lockedAmount: '0',
      staked: '0',
      blockHeight: '800000',
      blockHash: 'abc123...',
    };

    mockedFireblocksClient.getVaultAccountAsset.mockResolvedValue(mockVaultAsset);

    const result = await getVaultAccountAssetTool.handler({
      vaultAccountId: '0',
      assetId: 'BTC',
    });

    expect(mockedFireblocksClient.getVaultAccountAsset).toHaveBeenCalledWith({
      vaultAccountId: '0',
      assetId: 'BTC',
    });
    expect(result).toEqual(mockVaultAsset);
  });

  it('should validate required parameters', () => {
    const validArgs = {
      vaultAccountId: '0',
      assetId: 'BTC',
    };

    expect(() => getVaultAccountAssetTool.schema.parse(validArgs)).not.toThrow();
  });

  it('should reject invalid parameters', () => {
    const invalidArgs = {
      vaultAccountId: '0',
      // missing assetId
    };

    expect(() => getVaultAccountAssetTool.schema.parse(invalidArgs)).toThrow();
  });

  it('should reject extra parameters', () => {
    const invalidArgs = {
      vaultAccountId: '0',
      assetId: 'BTC',
      extraParam: 'invalid',
    };

    expect(() => getVaultAccountAssetTool.schema.parse(invalidArgs)).toThrow();
  });
});
