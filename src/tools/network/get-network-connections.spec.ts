import { fireblocksClient, GetNetworkConnectionsResponse } from '../../fireblocks-client';
import { getNetworkConnectionsTool } from './get-network-connections';

// Mock the fireblocks client
jest.mock('../../fireblocks-client', () => ({
  fireblocksClient: {
    getNetworkConnections: jest.fn(),
  },
}));

const mockedFireblocksClient = fireblocksClient as jest.Mocked<typeof fireblocksClient>;

describe('getNetworkConnectionsTool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('tool configuration', () => {
    it('should have correct name', () => {
      expect(getNetworkConnectionsTool.name).toBe('get_network_connections');
    });

    it('should have correct description', () => {
      expect(getNetworkConnectionsTool.description).toBe('Get a list of network connections');
    });

    it('should have a schema', () => {
      expect(getNetworkConnectionsTool.schema).toBeDefined();
    });

    it('should have a handler function', () => {
      expect(typeof getNetworkConnectionsTool.handler).toBe('function');
    });
  });

  describe('schema validation', () => {
    it('should accept empty arguments', () => {
      const result = getNetworkConnectionsTool.schema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject extra properties', () => {
      const result = getNetworkConnectionsTool.schema.safeParse({ invalidProp: 'value' });
      expect(result.success).toBe(false);
    });
  });

  describe('handler execution', () => {
    const mockNetworkConnections: GetNetworkConnectionsResponse = [
      {
        id: 'conn-1',
        name: 'Connection 1',
        status: 'CONNECTED',
        localNetworkId: 'local-net-1',
        remoteNetworkId: 'remote-net-1',
        routingPolicy: {
          crypto: 'DEFAULT',
          fiat: 'NONE',
        },
      } as any,
      {
        id: 'conn-2',
        name: 'Connection 2',
        status: 'CONNECTED',
        localNetworkId: 'local-net-2',
        remoteNetworkId: 'remote-net-2',
        routingPolicy: {
          crypto: 'CUSTOM',
          fiat: 'DEFAULT',
        },
      } as any,
    ];

    it('should successfully get network connections', async () => {
      mockedFireblocksClient.getNetworkConnections.mockResolvedValue(mockNetworkConnections);

      const result = await getNetworkConnectionsTool.handler({});

      expect(mockedFireblocksClient.getNetworkConnections).toHaveBeenCalledWith();
      expect(result).toEqual(mockNetworkConnections);
    });

    it('should handle empty network connections list', async () => {
      const emptyResponse: GetNetworkConnectionsResponse = [];
      mockedFireblocksClient.getNetworkConnections.mockResolvedValue(emptyResponse);

      const result = await getNetworkConnectionsTool.handler({});

      expect(mockedFireblocksClient.getNetworkConnections).toHaveBeenCalledWith();
      expect(result).toEqual(emptyResponse);
    });
  });
});
