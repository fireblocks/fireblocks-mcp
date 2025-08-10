# Fireblocks MCP Server

[![CI](https://github.com/fireblocks/fireblocks-mcp/actions/workflows/release.yml/badge.svg)](https://github.com/fireblocks/fireblocks-mcp/actions/workflows/release.yml)
[![NPM Version](https://badge.fury.io/js/%40fireblocks%2Fmcp-server.svg)](https://badge.fury.io/js/%40fireblocks%2Fmcp-server)

A Model Context Protocol (MCP) server implementation for the Fireblocks API, enabling AI assistants to interact with Fireblocks services through a standardized protocol.

## Overview

This MCP server provides secure access to Fireblocks functionality, allowing AI assistants to:

- Query and create transactions
- Retrieve and manage vault accounts and assets
- Access exchange account information
- Query network connections and policies
- Query blockchain information and whitelisted IP addresses
- Query external and internal wallets
- Query and filter workspace users

## Prerequisites

- Node.js >= 18.0.0 OR Docker installed
- Fireblocks API credentials (API Key and Private Key) - see [Adding new API Users](https://support.fireblocks.io/hc/en-us/articles/4407823826194-Adding-new-API-Users)

## Usage

### Running with MCP Clients

The Fireblocks MCP server can be integrated with various MCP-compatible clients. Here are configuration examples for popular clients:

#### Using the Published NPM Package

**Option 1: Using private key file path**
```json
{
  "mcpServers": {
    "fireblocks": {
      "command": "npx",
      "args": ["-y", "@fireblocks/mcp-server"],
      "env": {
        "FIREBLOCKS_API_KEY": "your-api-key",
        "FIREBLOCKS_PRIVATE_KEY_PATH": "/path/to/private-key.pem",
        "ENABLE_WRITE_OPERATIONS": "false"
      }
    }
  }
}
```

**Option 2: Using environment variable reference**
```json
{
  "mcpServers": {
    "fireblocks": {
      "command": "npx",
      "args": ["-y", "@fireblocks/mcp-server"],
      "env": {
        "FIREBLOCKS_API_KEY": "your-api-key",
        "FIREBLOCKS_PRIVATE_KEY_ENV_NAME": "FB_PRIVATE_KEY",
        "ENABLE_WRITE_OPERATIONS": "false"
      }
    }
  }
}
```
Then set `FB_PRIVATE_KEY` environment variable separately (not in the MCP config file).

#### Using Docker

```json
{
  "mcpServers": {
    "fireblocks": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "--env",
        "FIREBLOCKS_API_KEY=your-api-key",
        "--env",
        "FIREBLOCKS_PRIVATE_KEY_PATH=/keys/private-key.pem",
        "-v",
        "/path/to/your/private-key.pem:/keys/private-key.pem:ro",
        "fireblocksofficial/mcp-server"
      ]
    }
  }
}
```

Alternatively, you can run Docker directly:

```bash
docker run --rm -i \
  --env FIREBLOCKS_API_KEY=your-api-key \
  --env FIREBLOCKS_PRIVATE_KEY_PATH=/keys/private-key.pem \
  -v /path/to/your/private-key.pem:/keys/private-key.pem:ro \
  fireblocksofficial/mcp-server
```

Or use an environment file:

```bash
docker run --rm -i \
  --env-file .env \
  -v /path/to/your/private-key.pem:/keys/private-key.pem:ro \
  fireblocksofficial/mcp-server
```

#### For local global installation:

```bash
npm install -g @fireblocks/mcp-server
fireblocks-mcp
```

## Configuration

The MCP server requires Fireblocks API credentials to be configured via environment variables.

### Environment Variables

```bash
# Required: Fireblocks API Key
FIREBLOCKS_API_KEY=your-api-key-here

# Required: Private Key (choose one method)
# Method 1: Path to private key file
FIREBLOCKS_PRIVATE_KEY_PATH=/path/to/your/private-key.pem

# Method 2: Reference to another environment variable containing the private key
FIREBLOCKS_PRIVATE_KEY_ENV_NAME=MY_PRIVATE_KEY_VAR

# Required: API Base URL
FIREBLOCKS_API_BASE_URL=https://api.fireblocks.io/v1

# Optional: Enable write operations such as creating transactions (default: false)
ENABLE_WRITE_OPERATIONS=true

# Optional: Transport type - stdio (default) or http
MCP_TRANSPORT_TYPE=stdio

# Optional: HTTP transport specific settings (only when MCP_TRANSPORT_TYPE=http)
PORT=3000
HOST=127.0.0.1
CORS_ORIGIN=
```

### Transport Configuration

The Fireblocks MCP server supports two transport modes:

#### STDIO Transport (Default)
```bash
# Default transport - secure local-only communication
MCP_TRANSPORT_TYPE=stdio
```

Use STDIO transport when:
- Integrating with MCP clients like Claude Desktop
- Running locally for development
- Maximum security (no network exposure)

#### Streamable HTTP Transport
```bash
# Streamable HTTP transport - for web integrations and API access
MCP_TRANSPORT_TYPE=http
PORT=3000
HOST=127.0.0.1

# Replace with your client's origin
CORS_ORIGIN=https://yourdomain.com
```

**Security Note**: HTTP transport binds to localhost (`127.0.0.1`) by default for security. Configure `CORS_ORIGIN` carefully in production environments.

### Private Key Setup

You can provide your Fireblocks private key in two ways:

1. **File path** (recommended for security): Set `FIREBLOCKS_PRIVATE_KEY_PATH` to the path of your private key file
2. **Environment variable reference** : Set `FIREBLOCKS_PRIVATE_KEY_ENV_NAME` to the name of another environment variable that contains your private key

**Method 2 is specifically designed to avoid hardcoding private keys in MCP configuration files (like `mcp.json`) for security reasons.**

Example for method 2:
```bash
# Set the reference to your private key environment variable
FIREBLOCKS_PRIVATE_KEY_ENV_NAME=MY_SECRET_KEY

# Then set the actual private key in that variable (outside of mcp.json)
MY_SECRET_KEY="-----BEGIN PRIVATE KEY-----\nXYZ..."
```

This way, your `mcp.json` only contains the environment variable name reference, not the actual private key content.

## Available Tools

The Fireblocks MCP server provides the following tools:

### Transaction Management

#### `get_transactions`

Retrieve Fireblocks transactions with comprehensive filtering options.

**Parameters:**

- `before` (optional): Unix timestamp in milliseconds - get transactions before this date
- `after` (optional): Unix timestamp in milliseconds - get transactions after this date
- `status` (optional): Filter by transaction status
- `orderBy` (optional): Order by 'createdAt' or 'lastUpdated'
- `sort` (optional): Sort direction ('ASC' or 'DESC')
- `limit` (optional): Number of results (1-200, default: 50)
- `sourceType` (optional): Source type (VAULT_ACCOUNT, EXCHANGE_ACCOUNT, INTERNAL_WALLET, EXTERNAL_WALLET, CONTRACT, FIAT_ACCOUNT, NETWORK_CONNECTION, COMPOUND, UNKNOWN, GAS_STATION, END_USER_WALLET)
- `sourceId` (optional): Source ID
- `destType` (optional): Destination type (VAULT_ACCOUNT, EXCHANGE_ACCOUNT, INTERNAL_WALLET, EXTERNAL_WALLET, CONTRACT, FIAT_ACCOUNT, NETWORK_CONNECTION, COMPOUND, ONE_TIME_ADDRESS, END_USER_WALLET)
- `destId` (optional): Destination ID
- `assets` (optional): Comma-separated list of asset IDs
- `txHash` (optional): Filter by transaction hash
- `sourceWalletId` (optional): Filter by source wallet ID
- `destWalletId` (optional): Filter by destination wallet ID

#### `create_transaction`

Create a new transaction in Fireblocks.

### Vault Management

#### `get_vault_accounts`

Retrieve vault accounts with filtering and pagination.

**Parameters:**

- `namePrefix` (optional): Filter by account name prefix
- `nameSuffix` (optional): Filter by account name suffix
- `minAmountThreshold` (optional): Filter accounts with balance above threshold
- `assetId` (optional): Filter by asset ID
- `orderBy` (optional): Sort direction ('ASC' or 'DESC')
- `before` (optional): Pagination cursor for previous results
- `after` (optional): Pagination cursor for next results
- `limit` (optional): Number of results (1-200, default: 50)

#### `get_vault_account_by_id`

Get details of a specific vault account by ID.

**Parameters:**

- `vaultAccountId` (required): The ID of the vault account to retrieve

#### `get_vault_account_asset`

Get asset information for a specific vault account.

**Parameters:**

- `vaultAccountId` (required): The ID of the vault account
- `assetId` (required): The ID of the asset

#### `get_vault_assets`

Get asset balance for chosen assets with optional filtering.

**Parameters:**

- `accountNamePrefix` (optional): Filter vault accounts by name prefix
- `accountNameSuffix` (optional): Filter vault accounts by name suffix

#### `get_vault_balance_by_asset`

Get vault balance information for a specific asset.

**Parameters:**

- `assetId` (required): The ID of the asset

### Exchange Management

#### `get_exchange_accounts`

Retrieve exchange accounts with pagination.

**Parameters:**

- `limit` (optional): Number of results per page (1-5, default: 3)
- `before` (optional): Pagination cursor for previous results
- `after` (optional): Pagination cursor for next results

### Network

#### `get_network_connections`

Retrieve network connection information.

### Blockchain Information

#### `get_blockchains`

Retrieve information about supported blockchains.

#### `get_blockchain_asset`

Get asset information for a specific blockchain.

**Parameters:**

- `id` (required): The ID or legacyId of the blockchain asset

#### `get_assets`

Get assets supported by Fireblocks with comprehensive filtering options.

**Parameters:**

- `blockchainId` (optional): Blockchain ID of the assets
- `assetClass` (optional): Assets class (NATIVE, FT, FIAT, NFT, SFT)
- `symbol` (optional): Assets onchain symbol
- `scope` (optional): Scope of the assets (GLOBAL, LOCAL)
- `deprecated` (optional): Are assets deprecated (boolean)
- `ids` (optional): A list of asset IDs (max 100)
- `pageCursor` (optional): Next page cursor to fetch
- `pageSize` (optional): Items per page (100-1000, default: 500)

### Wallet Management

#### `get_external_wallets`

Retrieve external wallets under the workspace.

#### `get_internal_wallets`

Retrieve internal wallets under the workspace.

### User Management

#### `get_users`

List all users for the workspace with optional filtering (requires Admin permissions).

**Parameters:**

- `id` (optional): Filter users by specific user ID
- `email` (optional): Filter users by specific email address (case-insensitive)
- `query` (optional): Search users by name or email (case-insensitive partial matching)

### Security & Governance

#### `get_active_policy`

Get the currently active policy configuration.

#### `get_whitelist_ip_addresses`

Retrieve whitelisted IP addresses.

## Security

The use of an AI assistant to interact with your Fireblocks workspace presents inherent risks. Since AI models may produce unintended results, it is imperative to implement a robust security strategy to safeguard your assets. The following practices are highly recommended:

### Default Safe Configuration

⚠️ **Security Warning**: Write operations, such as creating transactions and modifying data in your Fireblocks workspace, are enabled by an AI assistant. For enhanced security, these operations (e.g., `create_transaction`) are disabled by default. They can be enabled by explicitly setting the `ENABLE_WRITE_OPERATIONS` environment variable to `true`. This should only be done in trusted environments with appropriate access controls.

### Principle of Least Privilege

When configuring an API user for the MCP server, it is essential to grant only the minimum permissions necessary for its intended function. For read-only tasks, a "Viewer" role, which is restricted to viewing transaction history, is the most secure option.

For a detailed guide on user roles, please refer to the [the best practices for choosing user roles](https://support.fireblocks.io/hc/en-us/articles/5254222799900-Best-practices-for-choosing-user-roles).

Instructions for creating a new API user can be found in the [Fireblocks guide on creating an API key](https://support.fireblocks.io/hc/en-us/articles/4407823826194-Adding-new-API-Users).

### Human in the Loop

We strongly advise utilizing the Fireblocks Policy Engine to ensure human oversight in the transaction approval process. A policy can be configured to require a manual designated signer to approve any transaction initiated by the AI assistant. More information can be found [here](https://support.fireblocks.io/hc/en-us/articles/7365877039004-Rule-parameters).

### Secure API Credentials

Your Fireblocks API Key and Private Key are highly sensitive credentials. Adherence to these best practices is mandatory:

- API credentials must never be shared publicly.
- The private key should be stored securely, preferably as a file with restricted access, as specified in the Configuration section.

## Prompt Examples

Here are some example prompts you can use with the Fireblocks MCP server:

```
Show me all my vault accounts and their balances
```

```
Get the last 10 transactions from today
```

```
What is my total Bitcoin balance across all accounts?
```

```
Top up my Bitstamp account to have 1000 USDC or USDT
```

```
Why did the policy block my last transaction?
```

**Note:** Transaction creation and top-up examples require `ENABLE_WRITE_OPERATIONS=true` and appropriate permissions.

## Development

### Getting Started

Follow these steps to set up the project for local development:

1. Clone the repository

```bash
git clone https://github.com/fireblocks/fireblocks-mcp.git
cd fireblocks-mcp
```

2. Install dependencies

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

### Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build the project
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run inspector` - Run with MCP Inspector for debugging

### Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Contributing

For more detailed contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).
