import { fireblocksClient } from '../../fireblocks-client';
import { getWhitelistIpAddressTool } from './get-whitelist-ip-addresses';

// Mock the fireblocks client
jest.mock('../../fireblocks-client', () => ({
  fireblocksClient: {
    getWhitelistIpAddresses: jest.fn(),
  },
}));

const mockedFireblocksClient = fireblocksClient as jest.Mocked<typeof fireblocksClient>;

describe('getWhitelistIpAddressTool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('tool configuration', () => {
    it('should have correct name', () => {
      expect(getWhitelistIpAddressTool.name).toBe('get_whitelist_ip_addresses');
    });

    it('should have correct description', () => {
      expect(getWhitelistIpAddressTool.description).toBe(
        'Get whitelisted IP addresses for a given API user',
      );
    });

    it('should have a schema', () => {
      expect(getWhitelistIpAddressTool.schema).toBeDefined();
    });

    it('should have a handler function', () => {
      expect(typeof getWhitelistIpAddressTool.handler).toBe('function');
    });
  });

  describe('schema validation', () => {
    it('should validate schema correctly', () => {
      const validArgs = { userId: 'user-123' };
      const result = getWhitelistIpAddressTool.schema.safeParse(validArgs);
      expect(result.success).toBe(true);
    });

    it('should reject invalid schema', () => {
      const invalidArgs = { invalidField: 'value' };
      const result = getWhitelistIpAddressTool.schema.safeParse(invalidArgs);
      expect(result.success).toBe(false);
    });

    it('should reject missing required field', () => {
      const invalidArgs = {};
      const result = getWhitelistIpAddressTool.schema.safeParse(invalidArgs);
      expect(result.success).toBe(false);
    });

    it('should reject extra properties', () => {
      const result = getWhitelistIpAddressTool.schema.safeParse({
        userId: 'user-123',
        invalidProp: 'value',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('handler execution', () => {
    const mockWhitelistResponse = [
      {
        id: 'ip-1',
        ipAddress: '192.168.1.1',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'ip-2',
        ipAddress: '10.0.0.1',
        status: 'ACTIVE',
        createdAt: '2024-01-02T00:00:00Z',
      },
    ] as any;

    it('should successfully get whitelist IP addresses', async () => {
      mockedFireblocksClient.getWhitelistIpAddresses.mockResolvedValue(mockWhitelistResponse);

      const result = await getWhitelistIpAddressTool.handler({ userId: 'user-123' });

      expect(mockedFireblocksClient.getWhitelistIpAddresses).toHaveBeenCalledWith({
        userId: 'user-123',
      });
      expect(result).toEqual(mockWhitelistResponse);
    });

    it('should handle different user IDs', async () => {
      mockedFireblocksClient.getWhitelistIpAddresses.mockResolvedValue(mockWhitelistResponse);

      const result = await getWhitelistIpAddressTool.handler({ userId: 'user-456' });

      expect(mockedFireblocksClient.getWhitelistIpAddresses).toHaveBeenCalledWith({
        userId: 'user-456',
      });
      expect(result).toEqual(mockWhitelistResponse);
    });

    it('should handle empty whitelist response', async () => {
      const emptyResponse = [] as any;
      mockedFireblocksClient.getWhitelistIpAddresses.mockResolvedValue(emptyResponse);

      const result = await getWhitelistIpAddressTool.handler({ userId: 'user-123' });

      expect(mockedFireblocksClient.getWhitelistIpAddresses).toHaveBeenCalledWith({
        userId: 'user-123',
      });
      expect(result).toEqual(emptyResponse);
    });
  });
});
