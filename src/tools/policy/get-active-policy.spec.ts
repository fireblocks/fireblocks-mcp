import { getActivePolicyTool } from './get-active-policy';

// Mock the fireblocks client
jest.mock('../../fireblocks-client', () => ({
  fireblocksClient: {
    getActivePolicy: jest.fn(),
  },
}));

import { fireblocksClient } from '../../fireblocks-client';

describe('getActivePolicyTool', () => {
  const mockFireblocksClient = fireblocksClient as jest.Mocked<typeof fireblocksClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have correct tool properties', () => {
    expect(getActivePolicyTool.name).toBe('get_active_policy');
    expect(getActivePolicyTool.description).toContain('Get the active policy and its validation');
    expect(getActivePolicyTool.schema).toBeDefined();
    expect(getActivePolicyTool.handler).toBeDefined();
  });

  it('should call fireblocksClient.getActivePolicy and return the result', async () => {
    const mockPolicy = {
      policy: {
        rules: [],
        metadata: {
          version: '1.0.0',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
      },
      validation: {
        status: 'VALID',
        checkResult: {
          errors: [],
          warnings: [],
        },
      },
    } as any; // Use 'any' to avoid complex type matching in tests

    mockFireblocksClient.getActivePolicy.mockResolvedValue(mockPolicy);

    const result = await getActivePolicyTool.handler({});

    expect(mockFireblocksClient.getActivePolicy).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockPolicy);
  });

  it('should handle errors from fireblocks client', async () => {
    const error = new Error('Fireblocks API error');
    mockFireblocksClient.getActivePolicy.mockRejectedValue(error);

    await expect(getActivePolicyTool.handler({})).rejects.toThrow('Fireblocks API error');
  });
});
