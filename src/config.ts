import { readFileSync } from 'fs';
import path from 'path';

export interface FireblocksConfig {
  apiKey: string;
  secretKey: string;
  basePath: string;
}

export interface Config {
  fireblocks: FireblocksConfig;
  allowWriteOperations: boolean;
}

/**
 * Reads and processes a private key from file or environment variable
 */
function getSecretKey(): string {
  const privateKeyPath = process.env.FIREBLOCKS_PRIVATE_KEY_PATH;
  const privateKeyEnvName = process.env.FIREBLOCKS_PRIVATE_KEY_ENV_NAME;

  let secretKey = '';

  if (privateKeyPath) {
    try {
      secretKey = readFileSync(path.resolve(privateKeyPath), 'utf8');
    } catch (error) {
      throw new Error(`Failed to read private key from file: ${privateKeyPath}. Error: ${error}`);
    }
  } else if (privateKeyEnvName && process.env[privateKeyEnvName]) {
    secretKey = process.env[privateKeyEnvName];
  } else if (privateKeyEnvName) {
    throw new Error(
      `FIREBLOCKS_PRIVATE_KEY_ENV_NAME environment variable is set to ${privateKeyEnvName} but this environment variable is empty`,
    );
  } else {
    throw new Error(
      'Either FIREBLOCKS_PRIVATE_KEY_PATH or FIREBLOCKS_PRIVATE_KEY_ENV_NAME must be set',
    );
  }

  // Process newlines in the private key
  return secretKey.split(String.raw`\n`).join('\n');
}

/**
 * Creates a Fireblocks configuration object
 */
function createFireblocksConfig(): FireblocksConfig {
  const apiKey = process.env.FIREBLOCKS_API_KEY;

  if (!apiKey) {
    throw new Error('FIREBLOCKS_API_KEY environment variable is required');
  }

  const secretKey = getSecretKey();
  const basePath = process.env.FIREBLOCKS_API_BASE_URL;

  if (!basePath) {
    throw new Error('FIREBLOCKS_API_BASE_URL environment variable is required');
  }

  return {
    apiKey,
    secretKey,
    basePath,
  };
}

export const config: Config = {
  fireblocks: createFireblocksConfig(),
  allowWriteOperations:
    process.env.ENABLE_WRITE_OPERATIONS === 'true' || process.env.ENABLE_WRITE_OPERATIONS === '1',
};
