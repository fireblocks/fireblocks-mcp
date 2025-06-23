import { fireblocksClient, GetVaultAccountsResponse } from '../../fireblocks-client';
import { getVaultAccountsTool } from './get-vault-accounts';

// Mock the fireblocks client
jest.mock('../../fireblocks-client', () => ({
  fireblocksClient: {
    getVaultAccounts: jest.fn(),
  },
}));

const mockedFireblocksClient = fireblocksClient as jest.Mocked<typeof fireblocksClient>;

describe('getVaultAccountsTool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('tool configuration', () => {
    it('should have correct name', () => {
      expect(getVaultAccountsTool.name).toBe('get_vault_accounts');
    });

    it('should have correct description', () => {
      expect(getVaultAccountsTool.description).toBe(
        'Get Fireblocks vault accounts with optional filtering',
      );
    });

    it('should have a schema', () => {
      expect(getVaultAccountsTool.schema).toBeDefined();
    });

    it('should have a handler function', () => {
      expect(typeof getVaultAccountsTool.handler).toBe('function');
    });
  });

  describe('schema validation', () => {
    it('should accept empty arguments', () => {
      const result = getVaultAccountsTool.schema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should accept valid arguments', () => {
      const validArgs = {
        namePrefix: 'test',
        nameSuffix: 'account',
        minAmountThreshold: 100.5,
        assetId: 'BTC',
        orderBy: 'ASC' as const,
        before: 'cursor-before-123',
        after: 'cursor-after-456',
        limit: 250,
      };

      const result = getVaultAccountsTool.schema.safeParse(validArgs);
      expect(result.success).toBe(true);
    });

    it('should reject invalid limit - below minimum', () => {
      const result = getVaultAccountsTool.schema.safeParse({ limit: 0 });
      expect(result.success).toBe(false);
    });

    it('should reject invalid limit - above maximum', () => {
      const result = getVaultAccountsTool.schema.safeParse({ limit: 501 });
      expect(result.success).toBe(false);
    });

    it('should reject non-integer limit', () => {
      const result = getVaultAccountsTool.schema.safeParse({ limit: 10.5 });
      expect(result.success).toBe(false);
    });

    it('should reject invalid orderBy', () => {
      const result = getVaultAccountsTool.schema.safeParse({ orderBy: 'invalid' });
      expect(result.success).toBe(false);
    });

    it('should accept valid orderBy values', () => {
      expect(getVaultAccountsTool.schema.safeParse({ orderBy: 'ASC' }).success).toBe(true);
      expect(getVaultAccountsTool.schema.safeParse({ orderBy: 'DESC' }).success).toBe(true);
    });

    it('should reject invalid data types', () => {
      expect(getVaultAccountsTool.schema.safeParse({ namePrefix: 123 }).success).toBe(false);
      expect(getVaultAccountsTool.schema.safeParse({ minAmountThreshold: 'invalid' }).success).toBe(
        false,
      );
      expect(getVaultAccountsTool.schema.safeParse({ limit: 'invalid' }).success).toBe(false);
    });

    it('should reject extra properties', () => {
      const result = getVaultAccountsTool.schema.safeParse({ invalidProp: 'value' });
      expect(result.success).toBe(false);
    });

    it('should validate negative minAmountThreshold', () => {
      const result = getVaultAccountsTool.schema.safeParse({ minAmountThreshold: -100 });
      expect(result.success).toBe(true); // Negative amounts might be valid for some use cases
    });
  });

  describe('handler execution', () => {
    const mockVaultAccountsResponse: GetVaultAccountsResponse = {
      accounts: [
        {
          id: 'vault-1',
          name: 'Main Trading Account',
          hiddenOnUI: false,
          customerRefId: 'ref-123',
          autoFuel: true,
          assets: [
            {
              id: 'BTC',
              total: '1.5',
              available: '1.4',
              pending: '0.1',
              frozen: '0',
              lockedAmount: '0',
              blockHeight: '800000',
              blockHash: 'block-hash-123',
            },
          ],
        },
        {
          id: 'vault-2',
          name: 'Cold Storage Account',
          hiddenOnUI: false,
          customerRefId: 'ref-456',
          autoFuel: false,
          assets: [
            {
              id: 'ETH',
              total: '10.0',
              available: '9.8',
              pending: '0.2',
              frozen: '0',
              lockedAmount: '0',
              blockHeight: '18500000',
              blockHash: 'block-hash-456',
            },
          ],
        },
      ],
      paging: {
        before: 'cursor-before',
        after: 'cursor-after',
      },
    };

    it('should successfully get vault accounts with no filters', async () => {
      mockedFireblocksClient.getVaultAccounts.mockResolvedValue(mockVaultAccountsResponse);

      const result = await getVaultAccountsTool.handler({});

      expect(mockedFireblocksClient.getVaultAccounts).toHaveBeenCalledWith({});
      expect(result).toEqual({
        count: 2,
        vaultAccounts: mockVaultAccountsResponse.accounts,
        paging: mockVaultAccountsResponse.paging,
      });
    });

    it('should successfully get vault accounts with filters', async () => {
      const args = {
        namePrefix: 'Main',
        assetId: 'BTC',
        limit: 10,
        orderBy: 'ASC' as const,
      };

      const filteredResponse: GetVaultAccountsResponse = {
        accounts: [mockVaultAccountsResponse.accounts![0]],
        paging: mockVaultAccountsResponse.paging,
      };

      mockedFireblocksClient.getVaultAccounts.mockResolvedValue(filteredResponse);

      const result = await getVaultAccountsTool.handler(args);

      expect(mockedFireblocksClient.getVaultAccounts).toHaveBeenCalledWith(args);
      expect(result).toEqual({
        count: 1,
        vaultAccounts: filteredResponse.accounts,
        paging: filteredResponse.paging,
      });
    });

    it('should return empty vault accounts array when no results', async () => {
      const emptyResponse: GetVaultAccountsResponse = {
        accounts: [],
        paging: {},
      };

      mockedFireblocksClient.getVaultAccounts.mockResolvedValue(emptyResponse);

      const result = await getVaultAccountsTool.handler({});

      expect(result).toEqual({
        count: 0,
        vaultAccounts: [],
        paging: {},
      });
    });

    it('should handle all optional parameters', async () => {
      const args = {
        namePrefix: 'Trading',
        nameSuffix: 'Account',
        minAmountThreshold: 100.5,
        assetId: 'BTC',
        orderBy: 'DESC' as const,
        before: 'cursor-before-123',
        after: 'cursor-after-456',
        limit: 100,
      };

      mockedFireblocksClient.getVaultAccounts.mockResolvedValue(mockVaultAccountsResponse);

      const result = await getVaultAccountsTool.handler(args);

      expect(mockedFireblocksClient.getVaultAccounts).toHaveBeenCalledWith(args);
      expect(result).toEqual({
        count: 2,
        vaultAccounts: mockVaultAccountsResponse.accounts,
        paging: mockVaultAccountsResponse.paging,
      });
    });

    it('should handle response without accounts property', async () => {
      const responseWithoutAccounts = { paging: {} } as GetVaultAccountsResponse;
      mockedFireblocksClient.getVaultAccounts.mockResolvedValue(responseWithoutAccounts);

      const result = await getVaultAccountsTool.handler({});

      expect(result).toEqual({
        count: 0,
        vaultAccounts: [],
        paging: {},
      });
    });

    it('should handle response without paging property', async () => {
      const responseWithoutPaging = {
        accounts: mockVaultAccountsResponse.accounts,
      } as GetVaultAccountsResponse;
      mockedFireblocksClient.getVaultAccounts.mockResolvedValue(responseWithoutPaging);

      const result = await getVaultAccountsTool.handler({});

      expect(result).toEqual({
        count: 2,
        vaultAccounts: mockVaultAccountsResponse.accounts,
        paging: undefined,
      });
    });

    it('should propagate errors from fireblocks client', async () => {
      const error = new Error('Fireblocks API error');
      mockedFireblocksClient.getVaultAccounts.mockRejectedValue(error);

      await expect(getVaultAccountsTool.handler({})).rejects.toThrow('Fireblocks API error');
    });

    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('Network timeout');
      mockedFireblocksClient.getVaultAccounts.mockRejectedValue(timeoutError);

      await expect(getVaultAccountsTool.handler({})).rejects.toThrow('Network timeout');
    });

    it('should handle authentication errors', async () => {
      const authError = new Error('Unauthorized');
      mockedFireblocksClient.getVaultAccounts.mockRejectedValue(authError);

      await expect(getVaultAccountsTool.handler({})).rejects.toThrow('Unauthorized');
    });
  });

  describe('edge cases', () => {
    it('should handle extreme limit values', async () => {
      const emptyResponse: GetVaultAccountsResponse = { accounts: [], paging: {} };
      mockedFireblocksClient.getVaultAccounts.mockResolvedValue(emptyResponse);

      // Test maximum limit
      await getVaultAccountsTool.handler({ limit: 500 });
      expect(mockedFireblocksClient.getVaultAccounts).toHaveBeenCalledWith({ limit: 500 });

      // Test minimum limit
      await getVaultAccountsTool.handler({ limit: 1 });
      expect(mockedFireblocksClient.getVaultAccounts).toHaveBeenCalledWith({ limit: 1 });
    });

    it('should handle edge case parameter values', async () => {
      const emptyResponse: GetVaultAccountsResponse = { accounts: [], paging: {} };
      mockedFireblocksClient.getVaultAccounts.mockResolvedValue(emptyResponse);

      // Test zero minAmountThreshold
      await getVaultAccountsTool.handler({ minAmountThreshold: 0 });
      expect(mockedFireblocksClient.getVaultAccounts).toHaveBeenCalledWith({
        minAmountThreshold: 0,
      });

      // Test empty string filters
      const emptyFilters = { namePrefix: '', nameSuffix: '', assetId: '' };
      await getVaultAccountsTool.handler(emptyFilters);
      expect(mockedFireblocksClient.getVaultAccounts).toHaveBeenCalledWith(emptyFilters);
    });
  });
});
