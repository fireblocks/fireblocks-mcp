import { z } from 'zod';
import { fireblocksClient, GetUsersResponse } from '../../fireblocks-client';
import { Tool } from '../../types';

const schema = z
  .object({
    id: z.string().optional().describe('Filter users by specific user ID'),
    email: z.string().optional().describe('Filter users by specific email address'),
    query: z
      .string()
      .optional()
      .describe('Search users by name (firstName + lastName) or email (case-insensitive)'),
  })
  .strict();

type GetUsersArgs = z.infer<typeof schema>;

export const getUsersTool: Tool<GetUsersArgs, GetUsersResponse> = {
  name: 'get_users',
  description:
    'List all users for the workspace with optional filtering (requires Admin permissions)',
  schema,
  handler: async (args: GetUsersArgs): Promise<GetUsersResponse> => {
    const users = await fireblocksClient.getUsers();

    let filteredUsers = users;

    // Filter by specific ID
    if (args.id) {
      filteredUsers = filteredUsers.filter(user => user.id === args.id);
    }

    // Filter by specific email
    if (args.email) {
      filteredUsers = filteredUsers.filter(
        user => user.email?.toLowerCase() === args.email!.toLowerCase(),
      );
    }

    // Query by name or email (case-insensitive)
    if (args.query) {
      const queryLower = args.query.toLowerCase();
      filteredUsers = filteredUsers.filter(user => {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim().toLowerCase();
        const email = (user.email || '').toLowerCase();

        return fullName.includes(queryLower) || email.includes(queryLower);
      });
    }

    return filteredUsers;
  },
};
