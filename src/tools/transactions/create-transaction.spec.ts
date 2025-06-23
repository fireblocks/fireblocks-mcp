import { CreateTransactionResponse } from '@fireblocks/ts-sdk';
import { fireblocksClient } from '../../fireblocks-client';
import { createTransactionTool } from './create-transaction';

// Mock the fireblocks client
jest.mock('../../fireblocks-client', () => ({
  fireblocksClient: {
    createTransaction: jest.fn(),
  },
}));

const mockedFireblocksClient = fireblocksClient as jest.Mocked<typeof fireblocksClient>;

describe('createTransactionTool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('tool configuration', () => {
    it('should have correct name', () => {
      expect(createTransactionTool.name).toBe('create_transaction');
    });

    it('should have correct description', () => {
      expect(createTransactionTool.description).toBe('Create a new Fireblocks transaction');
    });

    it('should have a schema', () => {
      expect(createTransactionTool.schema).toBeDefined();
    });

    it('should have a handler function', () => {
      expect(typeof createTransactionTool.handler).toBe('function');
    });
  });

  describe('schema validation', () => {
    const validMinimalArgs = {
      assetId: 'BTC',
      source: {
        type: 'VAULT_ACCOUNT',
        id: 'vault-123',
      },
      amount: '1.5',
    };

    it('should accept minimal valid arguments', () => {
      const result = createTransactionTool.schema.safeParse(validMinimalArgs);
      expect(result.success).toBe(true);
    });

    it('should require assetId', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { assetId, ...argsWithoutAssetId } = validMinimalArgs;
      const result = createTransactionTool.schema.safeParse(argsWithoutAssetId);
      expect(result.success).toBe(false);
    });

    it('should require source', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { source, ...argsWithoutSource } = validMinimalArgs;
      const result = createTransactionTool.schema.safeParse(argsWithoutSource);
      expect(result.success).toBe(false);
    });

    it('should require amount', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { amount, ...argsWithoutAmount } = validMinimalArgs;
      const result = createTransactionTool.schema.safeParse(argsWithoutAmount);
      expect(result.success).toBe(false);
    });

    it('should accept all valid operation types', () => {
      const validOperations = [
        'TRANSFER',
        'BURN',
        'CONTRACT_CALL',
        'PROGRAM_CALL',
        'MINT',
        'RAW',
        'TYPED_MESSAGE',
        'APPROVE',
        'ENABLE_ASSET',
      ];

      for (const operation of validOperations) {
        const result = createTransactionTool.schema.safeParse({
          ...validMinimalArgs,
          operation,
        });
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid operation types', () => {
      const result = createTransactionTool.schema.safeParse({
        ...validMinimalArgs,
        operation: 'INVALID_OPERATION',
      });
      expect(result.success).toBe(false);
    });

    it('should accept all valid peer path types', () => {
      const validPeerTypes = [
        'VAULT_ACCOUNT',
        'EXCHANGE_ACCOUNT',
        'INTERNAL_WALLET',
        'EXTERNAL_WALLET',
        'CONTRACT',
        'NETWORK_CONNECTION',
        'FIAT_ACCOUNT',
        'COMPOUND',
        'GAS_STATION',
        'ONE_TIME_ADDRESS',
        'UNKNOWN',
        'END_USER_WALLET',
        'PROGRAM_CALL',
        'MULTI_DESTINATION',
      ];

      for (const type of validPeerTypes) {
        const result = createTransactionTool.schema.safeParse({
          ...validMinimalArgs,
          source: { type, id: 'test-id' },
        });
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid peer path types', () => {
      const result = createTransactionTool.schema.safeParse({
        ...validMinimalArgs,
        source: { type: 'INVALID_TYPE', id: 'test-id' },
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid fee levels', () => {
      const validFeeLevels = ['LOW', 'MEDIUM', 'HIGH'];

      for (const feeLevel of validFeeLevels) {
        const result = createTransactionTool.schema.safeParse({
          ...validMinimalArgs,
          feeLevel,
        });
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid fee levels', () => {
      const result = createTransactionTool.schema.safeParse({
        ...validMinimalArgs,
        feeLevel: 'INVALID_LEVEL',
      });
      expect(result.success).toBe(false);
    });

    it('should accept one-time address in destination', () => {
      const result = createTransactionTool.schema.safeParse({
        ...validMinimalArgs,
        destination: {
          type: 'ONE_TIME_ADDRESS',
          oneTimeAddress: {
            address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
            tag: 'optional-tag',
          },
        },
      });
      expect(result.success).toBe(true);
    });

    it('should reject extra properties', () => {
      const result = createTransactionTool.schema.safeParse({
        ...validMinimalArgs,
        invalidProp: 'value',
      });
      expect(result.success).toBe(false);
    });

    it('should default operation to TRANSFER', () => {
      const result = createTransactionTool.schema.safeParse(validMinimalArgs);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.operation).toBe('TRANSFER');
      }
    });

    it('should validate boolean fields', () => {
      const booleanArgs = {
        ...validMinimalArgs,
        treatAsGrossAmount: true,
        forceSweep: false,
        failOnLowFee: true,
      };

      const result = createTransactionTool.schema.safeParse(booleanArgs);
      expect(result.success).toBe(true);
    });

    it('should validate string fields', () => {
      const stringArgs = {
        ...validMinimalArgs,
        note: 'Test transaction',
        externalTxId: 'ext-tx-123',
        fee: '0.001',
        priorityFee: '0.0001',
        maxFee: '0.01',
        gasLimit: '21000',
        gasPrice: '20000000000',
        customerRefId: 'customer-ref-123',
      };

      const result = createTransactionTool.schema.safeParse(stringArgs);
      expect(result.success).toBe(true);
    });
  });

  describe('handler execution', () => {
    const mockTransactionResponse = {
      id: 'tx-12345',
      status: 'SUBMITTED',
    } as CreateTransactionResponse;

    it('should successfully create transaction with minimal args', async () => {
      mockedFireblocksClient.createTransaction.mockResolvedValue(mockTransactionResponse);

      // Parse the args to get the actual type that will be passed to the handler
      const inputArgs = {
        assetId: 'BTC',
        source: {
          type: 'VAULT_ACCOUNT',
          id: 'vault-123',
        },
        amount: '1.5',
      };

      const parsedArgs = createTransactionTool.schema.parse(inputArgs);
      const result = await createTransactionTool.handler(parsedArgs);

      expect(mockedFireblocksClient.createTransaction).toHaveBeenCalledWith(parsedArgs);
      expect(result).toEqual(mockTransactionResponse);
    });

    it('should successfully create transaction with all optional fields', async () => {
      mockedFireblocksClient.createTransaction.mockResolvedValue(mockTransactionResponse);

      const inputArgs = {
        operation: 'TRANSFER',
        note: 'Test transaction',
        externalTxId: 'ext-tx-123',
        assetId: 'BTC',
        source: {
          type: 'VAULT_ACCOUNT',
          id: 'vault-123',
        },
        destination: {
          type: 'EXTERNAL_WALLET',
          id: 'wallet-456',
          name: 'Test Wallet',
        },
        amount: '1.5',
        treatAsGrossAmount: true,
        forceSweep: false,
        feeLevel: 'MEDIUM',
        fee: '0.001',
        priorityFee: '0.0001',
        failOnLowFee: true,
        maxFee: '0.01',
        gasLimit: '21000',
        gasPrice: '20000000000',
        customerRefId: 'customer-ref-123',
      };

      const parsedArgs = createTransactionTool.schema.parse(inputArgs);
      const result = await createTransactionTool.handler(parsedArgs);

      expect(mockedFireblocksClient.createTransaction).toHaveBeenCalledWith(parsedArgs);
      expect(result).toEqual(mockTransactionResponse);
    });

    it('should create transaction with one-time address destination', async () => {
      mockedFireblocksClient.createTransaction.mockResolvedValue(mockTransactionResponse);

      const inputArgs = {
        assetId: 'BTC',
        source: {
          type: 'VAULT_ACCOUNT',
          id: 'vault-123',
        },
        destination: {
          type: 'ONE_TIME_ADDRESS',
          oneTimeAddress: {
            address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
            tag: 'optional-tag',
          },
        },
        amount: '1.5',
      };

      const parsedArgs = createTransactionTool.schema.parse(inputArgs);
      const result = await createTransactionTool.handler(parsedArgs);

      expect(mockedFireblocksClient.createTransaction).toHaveBeenCalledWith(parsedArgs);
      expect(result).toEqual(mockTransactionResponse);
    });

    it('should propagate errors from fireblocks client', async () => {
      const error = new Error('Fireblocks API error');
      mockedFireblocksClient.createTransaction.mockRejectedValue(error);

      const inputArgs = {
        assetId: 'BTC',
        source: {
          type: 'VAULT_ACCOUNT',
          id: 'vault-123',
        },
        amount: '1.5',
      };

      const parsedArgs = createTransactionTool.schema.parse(inputArgs);
      await expect(createTransactionTool.handler(parsedArgs)).rejects.toThrow(
        'Fireblocks API error',
      );
    });

    it('should handle authentication errors', async () => {
      const authError = new Error('Unauthorized');
      mockedFireblocksClient.createTransaction.mockRejectedValue(authError);

      const inputArgs = {
        assetId: 'BTC',
        source: {
          type: 'VAULT_ACCOUNT',
          id: 'vault-123',
        },
        amount: '1.5',
      };

      const parsedArgs = createTransactionTool.schema.parse(inputArgs);
      await expect(createTransactionTool.handler(parsedArgs)).rejects.toThrow('Unauthorized');
    });

    it('should handle insufficient balance errors', async () => {
      const balanceError = new Error('Insufficient balance');
      mockedFireblocksClient.createTransaction.mockRejectedValue(balanceError);

      const inputArgs = {
        assetId: 'BTC',
        source: {
          type: 'VAULT_ACCOUNT',
          id: 'vault-123',
        },
        amount: '1.5',
      };

      const parsedArgs = createTransactionTool.schema.parse(inputArgs);
      await expect(createTransactionTool.handler(parsedArgs)).rejects.toThrow(
        'Insufficient balance',
      );
    });
  });

  describe('edge cases', () => {
    const mockResponse = { id: 'tx-123', status: 'SUBMITTED' } as CreateTransactionResponse;

    it('should handle different asset types', async () => {
      const assets = ['BTC', 'ETH', 'USDC', 'USDT'];

      for (const assetId of assets) {
        mockedFireblocksClient.createTransaction.mockResolvedValue(mockResponse);

        const inputArgs = {
          assetId,
          source: { type: 'VAULT_ACCOUNT', id: 'vault-123' },
          amount: '1.0',
        };

        const parsedArgs = createTransactionTool.schema.parse(inputArgs);
        const result = await createTransactionTool.handler(parsedArgs);

        expect(result).toEqual(mockResponse);
      }
    });

    it('should handle very small amounts', async () => {
      mockedFireblocksClient.createTransaction.mockResolvedValue(mockResponse);

      const inputArgs = {
        assetId: 'BTC',
        source: { type: 'VAULT_ACCOUNT', id: 'vault-123' },
        amount: '0.00000001', // 1 satoshi
      };

      const parsedArgs = createTransactionTool.schema.parse(inputArgs);
      const result = await createTransactionTool.handler(parsedArgs);

      expect(result).toEqual(mockResponse);
    });

    it('should handle very large amounts', async () => {
      mockedFireblocksClient.createTransaction.mockResolvedValue(mockResponse);

      const inputArgs = {
        assetId: 'BTC',
        source: { type: 'VAULT_ACCOUNT', id: 'vault-123' },
        amount: '21000000.00000000', // Max BTC supply
      };

      const parsedArgs = createTransactionTool.schema.parse(inputArgs);
      const result = await createTransactionTool.handler(parsedArgs);

      expect(result).toEqual(mockResponse);
    });

    it('should handle different source types', async () => {
      const sourceTypes = ['VAULT_ACCOUNT', 'EXCHANGE_ACCOUNT', 'INTERNAL_WALLET'];

      for (const type of sourceTypes) {
        mockedFireblocksClient.createTransaction.mockResolvedValue(mockResponse);

        const inputArgs = {
          assetId: 'BTC',
          source: { type, id: 'source-123' },
          amount: '1.0',
        };

        const parsedArgs = createTransactionTool.schema.parse(inputArgs);
        const result = await createTransactionTool.handler(parsedArgs);

        expect(result).toEqual(mockResponse);
      }
    });
  });
});
