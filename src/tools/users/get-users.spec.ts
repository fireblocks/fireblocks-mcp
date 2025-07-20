import { getUsersTool } from './get-users';

// Mock the fireblocks client
jest.mock('../../fireblocks-client', () => ({
  fireblocksClient: {
    getUsers: jest.fn(),
  },
}));

import { fireblocksClient } from '../../fireblocks-client';

describe('getUsersTool', () => {
  const mockFireblocksClient = fireblocksClient as jest.Mocked<typeof fireblocksClient>;

  const mockUsers = [
    {
      id: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
      role: 'Admin',
      email: 'john.doe@example.com',
      enabled: true,
    },
    {
      id: 'user-2',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'Viewer',
      email: 'jane.smith@example.com',
      enabled: true,
    },
    {
      id: 'user-3',
      firstName: 'Bob',
      lastName: 'Wilson',
      role: 'Editor',
      email: 'bob.wilson@company.org',
      enabled: false,
    },
  ] as any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFireblocksClient.getUsers.mockResolvedValue(mockUsers);
  });

  it('should have correct tool properties', () => {
    expect(getUsersTool.name).toBe('get_users');
    expect(getUsersTool.description).toBe(
      'List all users for the workspace with optional filtering (requires Admin permissions)',
    );
    expect(getUsersTool.schema).toBeDefined();
    expect(getUsersTool.handler).toBeDefined();
  });

  describe('without filters', () => {
    it('should call fireblocksClient.getUsers and return all users', async () => {
      const result = await getUsersTool.handler({});

      expect(mockFireblocksClient.getUsers).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(3);
    });
  });

  describe('id filter', () => {
    it('should filter users by specific ID', async () => {
      const result = await getUsersTool.handler({ id: 'user-2' });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockUsers[1]);
      expect(result[0].id).toBe('user-2');
    });

    it('should return empty array when ID not found', async () => {
      const result = await getUsersTool.handler({ id: 'nonexistent-user' });

      expect(result).toHaveLength(0);
    });
  });

  describe('email filter', () => {
    it('should filter users by specific email (case-insensitive)', async () => {
      const result = await getUsersTool.handler({ email: 'JANE.SMITH@EXAMPLE.COM' });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockUsers[1]);
      expect(result[0].email).toBe('jane.smith@example.com');
    });

    it('should return empty array when email not found', async () => {
      const result = await getUsersTool.handler({ email: 'nonexistent@example.com' });

      expect(result).toHaveLength(0);
    });
  });

  describe('query filter', () => {
    it('should search users by first name (case-insensitive)', async () => {
      const result = await getUsersTool.handler({ query: 'john' });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockUsers[0]);
    });

    it('should search users by last name (case-insensitive)', async () => {
      const result = await getUsersTool.handler({ query: 'SMITH' });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockUsers[1]);
    });

    it('should search users by full name', async () => {
      const result = await getUsersTool.handler({ query: 'Jane Smith' });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockUsers[1]);
    });

    it('should search users by email', async () => {
      const result = await getUsersTool.handler({ query: 'company.org' });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockUsers[2]);
    });

    it('should search users by partial email', async () => {
      const result = await getUsersTool.handler({ query: 'example.com' });

      expect(result).toHaveLength(2);
      expect(result).toContain(mockUsers[0]);
      expect(result).toContain(mockUsers[1]);
    });

    it('should return empty array when query not found', async () => {
      const result = await getUsersTool.handler({ query: 'nonexistent' });

      expect(result).toHaveLength(0);
    });
  });

  describe('combined filters', () => {
    it('should apply multiple filters together', async () => {
      // This should return no results since user-1 doesn't have jane.smith email
      const result = await getUsersTool.handler({
        id: 'user-1',
        email: 'jane.smith@example.com',
      });

      expect(result).toHaveLength(0);
    });

    it('should work with id and query filters', async () => {
      const result = await getUsersTool.handler({
        id: 'user-2',
        query: 'Jane',
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockUsers[1]);
    });
  });

  describe('schema validation', () => {
    it('should accept empty arguments', () => {
      const result = getUsersTool.schema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should accept all valid filter parameters', () => {
      const result = getUsersTool.schema.safeParse({
        id: 'user-1',
        email: 'test@example.com',
        query: 'John Doe',
      });
      expect(result.success).toBe(true);
    });

    it('should reject extra properties', () => {
      const result = getUsersTool.schema.safeParse({
        id: 'user-1',
        invalidProp: 'value',
      });
      expect(result.success).toBe(false);
    });

    it('should reject non-string filter values', () => {
      const result = getUsersTool.schema.safeParse({
        id: 123,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle errors from fireblocks client', async () => {
      const error = new Error('Fireblocks API error');
      mockFireblocksClient.getUsers.mockRejectedValue(error);

      await expect(getUsersTool.handler({})).rejects.toThrow('Fireblocks API error');
    });

    it('should handle permission errors', async () => {
      const permissionError = new Error('Insufficient permissions');
      mockFireblocksClient.getUsers.mockRejectedValue(permissionError);

      await expect(getUsersTool.handler({ query: 'test' })).rejects.toThrow(
        'Insufficient permissions',
      );
    });
  });

  describe('edge cases', () => {
    it('should handle users with missing name fields', async () => {
      const usersWithMissingFields = [
        {
          id: 'user-1',
          firstName: '',
          lastName: '',
          email: 'test@example.com',
          role: 'Admin',
          enabled: true,
        },
        { id: 'user-2', email: 'another@example.com', role: 'Viewer', enabled: true },
      ] as any;

      mockFireblocksClient.getUsers.mockResolvedValue(usersWithMissingFields);

      const result = await getUsersTool.handler({ query: 'test@example.com' });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('user-1');
    });

    it('should handle users with missing email fields', async () => {
      const usersWithMissingEmail = [
        { id: 'user-1', firstName: 'John', lastName: 'Doe', role: 'Admin', enabled: true },
      ] as any;

      mockFireblocksClient.getUsers.mockResolvedValue(usersWithMissingEmail);

      const result = await getUsersTool.handler({ query: 'john' });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('user-1');
    });
  });
});
