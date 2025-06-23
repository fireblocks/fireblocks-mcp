import { FireblocksError } from '@fireblocks/ts-sdk';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { ZodError } from 'zod';

export function createMcpError(code: ErrorCode, message: string, data?: any): McpError {
  return new McpError(code, message, data);
}

export function errorHandling(error: unknown): McpError {
  if (error instanceof ZodError) {
    return createMcpError(ErrorCode.InvalidParams, `Invalid input: ${error.message}`);
  }

  if (error instanceof FireblocksError) {
    const { message, response } = error;
    // Check for common Fireblocks API errors
    if (response?.statusCode === 401) {
      return createMcpError(
        ErrorCode.InvalidRequest,
        `Fireblocks API authentication failed. Please check your API key and private key`,
      );
    }

    if (response?.statusCode === 403) {
      return createMcpError(
        ErrorCode.InvalidRequest,
        `Fireblocks API access forbidden. Please check your API permissions. ${message}`,
      );
    }

    if (response?.statusCode === 429) {
      return createMcpError(
        ErrorCode.InternalError,
        `Fireblocks API rate limit exceeded. Please try again later. ${message}`,
      );
    }

    if (response?.statusCode === 500) {
      return createMcpError(
        ErrorCode.InternalError,
        `Fireblocks API internal server error. Please try again later. ${message}`,
      );
    }

    // Generic error handling
    return createMcpError(ErrorCode.InternalError, `Fireblocks API error: ${error.message}`);
  }

  if (error instanceof Error) {
    return createMcpError(ErrorCode.InternalError, `Unexpected error: ${error.message}`);
  }

  return createMcpError(ErrorCode.InternalError, `Unknown error occurred: ${error}`);
}
