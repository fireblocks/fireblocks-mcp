import { GetTransactionsResponse } from '@fireblocks/ts-sdk';
import { fireblocksClient } from '../../fireblocks-client';
import { getTransactionsTool } from './get-transactions';

// Mock the fireblocks client
jest.mock('../../fireblocks-client', () => ({
  fireblocksClient: {
    getTransactions: jest.fn(),
  },
}));

const mockedFireblocksClient = fireblocksClient as jest.Mocked<typeof fireblocksClient>;

describe('getTransactionsTool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('tool configuration', () => {
    it('should have correct name', () => {
      expect(getTransactionsTool.name).toBe('get_transactions');
    });

    it('should have correct description', () => {
      expect(getTransactionsTool.description).toBe(
        'Get Fireblocks transactions with optional filtering',
      );
    });

    it('should have a schema', () => {
      expect(getTransactionsTool.schema).toBeDefined();
    });

    it('should have a handler function', () => {
      expect(typeof getTransactionsTool.handler).toBe('function');
    });
  });

  describe('schema validation', () => {
    it('should accept empty arguments', () => {
      const result = getTransactionsTool.schema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should accept valid arguments', () => {
      const validArgs = {
        before: '1640995200000',
        after: '1640908800000',
        status: 'COMPLETED',
        orderBy: 'createdAt' as const,
        sort: 'DESC' as const,
        limit: 100,
        sourceType: 'VAULT_ACCOUNT' as const,
        sourceId: 'vault-123',
        destType: 'EXTERNAL_WALLET' as const,
        destId: 'wallet-456',
        assets: 'BTC,ETH',
        txHash: '0x1234567890abcdef',
        sourceWalletId: 'source-wallet-123',
        destWalletId: 'dest-wallet-456',
      };

      const result = getTransactionsTool.schema.safeParse(validArgs);
      expect(result.success).toBe(true);
    });

    it('should reject invalid limit', () => {
      const result = getTransactionsTool.schema.safeParse({ limit: 0 });
      expect(result.success).toBe(false);
    });

    it('should reject limit exceeding maximum', () => {
      const result = getTransactionsTool.schema.safeParse({ limit: 501 });
      expect(result.success).toBe(false);
    });

    it('should reject invalid orderBy', () => {
      const result = getTransactionsTool.schema.safeParse({ orderBy: 'invalid' });
      expect(result.success).toBe(false);
    });

    it('should reject invalid sort', () => {
      const result = getTransactionsTool.schema.safeParse({ sort: 'invalid' });
      expect(result.success).toBe(false);
    });

    it('should reject invalid sourceType', () => {
      const result = getTransactionsTool.schema.safeParse({ sourceType: 'INVALID_TYPE' });
      expect(result.success).toBe(false);
    });

    it('should reject invalid destType', () => {
      const result = getTransactionsTool.schema.safeParse({ destType: 'INVALID_TYPE' });
      expect(result.success).toBe(false);
    });

    it('should reject extra properties', () => {
      const result = getTransactionsTool.schema.safeParse({ invalidProp: 'value' });
      expect(result.success).toBe(false);
    });
  });

  describe('handler execution', () => {
    const mockTransactions: GetTransactionsResponse = [
      {
        id: 'tx-1',
        status: 'COMPLETED',
        source: {
          type: 'VAULT_ACCOUNT',
          id: 'vault-123',
        },
        destination: {
          type: 'EXTERNAL_WALLET',
          id: 'wallet-456',
        },
        amount: 1.5,
        assetId: 'BTC',
        createdAt: 1640995200000,
        lastUpdated: 1640995500000,
      },
      {
        id: 'tx-2',
        status: 'PENDING',
        source: {
          type: 'VAULT_ACCOUNT',
          id: 'vault-789',
        },
        destination: {
          type: 'EXTERNAL_WALLET',
          id: 'wallet-abc',
        },
        amount: 0.5,
        assetId: 'ETH',
        createdAt: 1641081600000,
        lastUpdated: 1641081660000,
      },
    ] as GetTransactionsResponse;

    it('should successfully get transactions with no filters', async () => {
      mockedFireblocksClient.getTransactions.mockResolvedValue(mockTransactions);

      const result = await getTransactionsTool.handler({});

      expect(mockedFireblocksClient.getTransactions).toHaveBeenCalledWith({});
      expect(result).toEqual({
        success: true,
        count: 2,
        transactions: mockTransactions,
      });
    });

    it('should successfully get transactions with filters', async () => {
      const args = {
        status: 'COMPLETED',
        limit: 10,
        orderBy: 'createdAt' as const,
        sort: 'DESC' as const,
      };

      mockedFireblocksClient.getTransactions.mockResolvedValue([
        mockTransactions[0],
      ] as GetTransactionsResponse);

      const result = await getTransactionsTool.handler(args);

      expect(mockedFireblocksClient.getTransactions).toHaveBeenCalledWith(args);
      expect(result).toEqual({
        success: true,
        count: 1,
        transactions: [mockTransactions[0]],
      });
    });

    it('should return empty transactions array when no results', async () => {
      mockedFireblocksClient.getTransactions.mockResolvedValue([] as GetTransactionsResponse);

      const result = await getTransactionsTool.handler({});

      expect(result).toEqual({
        success: true,
        count: 0,
        transactions: [],
      });
    });

    it('should handle all optional parameters', async () => {
      const args = {
        before: '1640995200000',
        after: '1640908800000',
        status: 'COMPLETED',
        orderBy: 'createdAt' as const,
        sort: 'DESC' as const,
        limit: 100,
        sourceType: 'VAULT_ACCOUNT' as const,
        sourceId: 'vault-123',
        destType: 'EXTERNAL_WALLET' as const,
        destId: 'wallet-456',
        assets: 'BTC,ETH',
        txHash: '0x1234567890abcdef',
        sourceWalletId: 'source-wallet-123',
        destWalletId: 'dest-wallet-456',
      };

      mockedFireblocksClient.getTransactions.mockResolvedValue(mockTransactions);

      const result = await getTransactionsTool.handler(args);

      expect(mockedFireblocksClient.getTransactions).toHaveBeenCalledWith(args);
      expect(result).toEqual({
        success: true,
        count: 2,
        transactions: mockTransactions,
      });
    });

    it('should propagate errors from fireblocks client', async () => {
      const error = new Error('Fireblocks API error');
      mockedFireblocksClient.getTransactions.mockRejectedValue(error);

      await expect(getTransactionsTool.handler({})).rejects.toThrow('Fireblocks API error');
    });

    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('Network timeout');
      mockedFireblocksClient.getTransactions.mockRejectedValue(timeoutError);

      await expect(getTransactionsTool.handler({})).rejects.toThrow('Network timeout');
    });

    it('should handle authentication errors', async () => {
      const authError = new Error('Unauthorized');
      mockedFireblocksClient.getTransactions.mockRejectedValue(authError);

      await expect(getTransactionsTool.handler({})).rejects.toThrow('Unauthorized');
    });
  });

  describe('edge cases', () => {
    it('should handle maximum limit', async () => {
      const args = { limit: 500 };
      mockedFireblocksClient.getTransactions.mockResolvedValue([] as GetTransactionsResponse);

      const result = await getTransactionsTool.handler(args);

      expect(mockedFireblocksClient.getTransactions).toHaveBeenCalledWith(args);
      expect(result.success).toBe(true);
    });

    it('should handle minimum limit', async () => {
      const args = { limit: 1 };
      mockedFireblocksClient.getTransactions.mockResolvedValue([] as GetTransactionsResponse);

      const result = await getTransactionsTool.handler(args);

      expect(mockedFireblocksClient.getTransactions).toHaveBeenCalledWith(args);
      expect(result.success).toBe(true);
    });

    it('should handle all valid sourceTypes', async () => {
      const validSourceTypes = [
        'VAULT_ACCOUNT',
        'EXCHANGE_ACCOUNT',
        'INTERNAL_WALLET',
        'EXTERNAL_WALLET',
        'CONTRACT',
        'FIAT_ACCOUNT',
        'NETWORK_CONNECTION',
        'COMPOUND',
        'UNKNOWN',
        'GAS_STATION',
        'END_USER_WALLET',
      ] as const;

      for (const sourceType of validSourceTypes) {
        const result = getTransactionsTool.schema.safeParse({ sourceType });
        expect(result.success).toBe(true);
      }
    });

    it('should handle all valid destTypes', async () => {
      const validDestTypes = [
        'VAULT_ACCOUNT',
        'EXCHANGE_ACCOUNT',
        'INTERNAL_WALLET',
        'EXTERNAL_WALLET',
        'CONTRACT',
        'FIAT_ACCOUNT',
        'NETWORK_CONNECTION',
        'COMPOUND',
        'ONE_TIME_ADDRESS',
        'END_USER_WALLET',
      ] as const;

      for (const destType of validDestTypes) {
        const result = getTransactionsTool.schema.safeParse({ destType });
        expect(result.success).toBe(true);
      }
    });
  });

  describe('parameter validation', () => {
    it('should validate limit range', () => {
      expect(getTransactionsTool.schema.safeParse({ limit: 1 }).success).toBe(true);
      expect(getTransactionsTool.schema.safeParse({ limit: 250 }).success).toBe(false);
      expect(getTransactionsTool.schema.safeParse({ limit: 0 }).success).toBe(false);
      expect(getTransactionsTool.schema.safeParse({ limit: -1 }).success).toBe(false);
    });

    it('should validate timestamp strings', () => {
      expect(getTransactionsTool.schema.safeParse({ before: '1640995200000' }).success).toBe(true);
      expect(getTransactionsTool.schema.safeParse({ after: '1640908800000' }).success).toBe(true);
    });

    it('should validate enum values', () => {
      expect(getTransactionsTool.schema.safeParse({ orderBy: 'createdAt' }).success).toBe(true);
      expect(getTransactionsTool.schema.safeParse({ orderBy: 'lastUpdated' }).success).toBe(true);
      expect(getTransactionsTool.schema.safeParse({ sort: 'ASC' }).success).toBe(true);
      expect(getTransactionsTool.schema.safeParse({ sort: 'DESC' }).success).toBe(true);
    });
  });
});
