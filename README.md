# Fireblocks MCP Server

[![CI](https://github.com/fireblocks/fireblocks-mcp/actions/workflows/release.yml/badge.svg)](https://github.com/fireblocks/fireblocks-mcp/actions/workflows/release.yml)
[![Coverage](https://codecov.io/gh/fireblocks/fireblocks-mcp/branch/main/graph/badge.svg)](https://codecov.io/gh/fireblocks/fireblocks-mcp)
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

- Node.js >= 18.0.0
- npm or yarn

## Installation

### Step 1: Create an API key

To get started, you'll need a **Fireblocks API Key** and its corresponding **secret key file**.

1. Follow the [Fireblocks guide on creating an API key](https://support.fireblocks.io/hc/en-us/articles/4407823826194-Adding-new-API-Users).

🔒 *Security Note: When configuring an API user for the MCP server, it is critical to grant only the minimum permissions required for its specific tasks. For example, for read-only tasks like viewing transaction history, the "Viewer" role is the most secure option. For a detailed guide on user roles, please refer to the [best practices for choosing user roles](https://support.fireblocks.io/hc/en-us/articles/5254222799900-Best-practices-for-choosing-user-roles)*.

2. Once created, securely store both the API Key and the secret key file (e.g., `fireblocks-secret.key`). You will need both for the next steps.

### Step 2: Configure your MCP Client

#### For Claude Desktop

1. Open **Claude Desktop**.
2. Go to **Settings → Developer → Edit Config** to open the `claude_desktop_config.json` file.
3. Add a new server with this configuration:
```json
{
  "mcpServers": {
    "fireblocks": {
      "command": "npx",
      "args": ["-y", "@fireblocks/mcp-server"],
      "env": {
        "FIREBLOCKS_API_KEY": "your-api-key",
        "FIREBLOCKS_PRIVATE_KEY_PATH": "your-fireblocks-api-secret-key-filepath",
        "ENABLE_WRITE_OPERATIONS": "false"
      }
    }
  }
}
```

#### For Cursor

1. Open **Cursor**.
2. Go to **Settings → Cursor Settings → Tools & Integrations**.
3. Select **MCP Tools** and click **Add Custom MCP** to open the `mcp.json` file.
4. Add a new server with this configuration:
```json
{
  "mcpServers": {
    "fireblocks": {
      "command": "npx",
      "args": ["-y", "@fireblocks/mcp-server"],
      "env": {
        "FIREBLOCKS_API_KEY": "your-api-key",
        "FIREBLOCKS_PRIVATE_KEY_PATH": "your-api-secret-key-filepath",
        "ENABLE_WRITE_OPERATIONS": "false"
      }
    }
  }
}
```

### Step 3: Customize MCP Server Settings (Optional)
* To enable write operations, set the `ENABLE_WRITE_OPERATIONS` environment variable to `true`. Be sure to read the **Security Considerations** section before doing so.
* If you need to use a **non-default Fireblocks environment** (e.g., Non-US, Sandbox), you must add the `FIREBLOCKS_API_BASE_URL` setting. Set its value to the base URL of the specific environment's API.

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

### Security & Governance

#### `get_active_policy`

Get the currently active policy configuration.

#### `get_whitelist_ip_addresses`

Retrieve whitelisted IP addresses.

### User Management

#### `get_users`

List all users for the workspace with optional filtering (requires Admin permissions).

**Parameters:**

- `id` (optional): Filter users by specific user ID
- `email` (optional): Filter users by specific email address (case-insensitive)
- `query` (optional): Search users by name or email (case-insensitive partial matching)


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

## Security Considerations

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


## How to develop in the repo

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
