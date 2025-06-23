import { getExchangeAccountsTool } from './get-exchange-accounts';

// Mock the fireblocks client
jest.mock('../../fireblocks-client', () => ({
  fireblocksClient: {
    getExchangeAccounts: jest.fn(),
  },
}));

import { fireblocksClient } from '../../fireblocks-client';

describe('getExchangeAccountsTool', () => {
  const mockFireblocksClient = fireblocksClient as jest.Mocked<typeof fireblocksClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have correct tool properties', () => {
    expect(getExchangeAccountsTool.name).toBe('get_exchange_accounts');
    expect(getExchangeAccountsTool.description).toBe(
      'Get exchange accounts with pagination support',
    );
    expect(getExchangeAccountsTool.schema).toBeDefined();
    expect(getExchangeAccountsTool.handler).toBeDefined();
  });

  it('should call fireblocksClient.getExchangeAccounts with correct parameters', async () => {
    const mockResponse = {
      data: [
        {
          id: 'binance-1',
          type: 'BINANCE',
          name: 'Binance Account',
          status: 'ENABLED',
          assets: [
            {
              id: 'BTC',
              balance: '1.5',
              total: '1.5',
              available: '1.5',
              pending: '0',
            },
          ],
        },
      ],
      paging: {
        before: null,
        after: 'cursor123',
      },
    } as any;

    mockFireblocksClient.getExchangeAccounts.mockResolvedValue(mockResponse);

    const result = await getExchangeAccountsTool.handler({ limit: 5, after: 'cursor456' });

    expect(mockFireblocksClient.getExchangeAccounts).toHaveBeenCalledTimes(1);
    expect(mockFireblocksClient.getExchangeAccounts).toHaveBeenCalledWith({
      limit: 5,
      after: 'cursor456',
    });
    expect(result).toEqual(mockResponse);
  });

  it('should use default limit when not provided', async () => {
    const mockResponse = {
      data: [],
      paging: { before: null, after: null },
    } as any;

    mockFireblocksClient.getExchangeAccounts.mockResolvedValue(mockResponse);

    // Parse the empty object through the schema to apply defaults
    const parsedArgs = getExchangeAccountsTool.schema.parse({});
    const result = await getExchangeAccountsTool.handler(parsedArgs);

    expect(mockFireblocksClient.getExchangeAccounts).toHaveBeenCalledWith({
      limit: 3, // default value
    });
    expect(result).toEqual(mockResponse);
  });

  it('should handle errors from fireblocks client', async () => {
    const error = new Error('Exchange accounts fetch failed');
    mockFireblocksClient.getExchangeAccounts.mockRejectedValue(error);

    await expect(getExchangeAccountsTool.handler({ limit: 1 })).rejects.toThrow(
      'Exchange accounts fetch failed',
    );
  });

  it('should validate limit parameter constraints', () => {
    const schema = getExchangeAccountsTool.schema;

    // Should fail with limit > 5
    expect(() => schema.parse({ limit: 6 })).toThrow();

    // Should fail with limit < 1
    expect(() => schema.parse({ limit: 0 })).toThrow();

    // Should pass with valid limit
    expect(schema.parse({ limit: 3 })).toEqual({ limit: 3 });

    // Should use default limit
    expect(schema.parse({})).toEqual({ limit: 3 });
  });
});
