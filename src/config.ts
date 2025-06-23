import { readFileSync } from 'fs';
import path from 'path';

export interface FireblocksConfig {
  apiKey: string;
  secretKey: string;
  basePath: string;
}

export interface Config {
  fireblocks: FireblocksConfig;
}

/**
 * Reads and processes a private key from file or environment variable
 */
function getSecretKey(): string {
  const privateKeyPath = process.env.FIREBLOCKS_PRIVATE_KEY_PATH;
  const privateKeyEnv = process.env.FIREBLOCKS_PRIVATE_KEY;

  let secretKey = '';

  if (privateKeyPath) {
    try {
      secretKey = readFileSync(path.resolve(privateKeyPath), 'utf8');
    } catch (error) {
      throw new Error(`Failed to read private key from file: ${privateKeyPath}. Error: ${error}`);
    }
  } else if (privateKeyEnv) {
    secretKey = privateKeyEnv;
  } else {
    throw new Error('Either FIREBLOCKS_PRIVATE_KEY_PATH or FIREBLOCKS_PRIVATE_KEY must be set');
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
  const basePath = process.env.FIREBLOCKS_API_BASE_URL || 'https://api.fireblocks.io/v2';

  return {
    apiKey,
    secretKey,
    basePath,
  };
}

export const config: Config = {
  fireblocks: createFireblocksConfig(),
};
