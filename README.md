# Fireblocks MCP Server

[![CI](https://github.com/fireblocks/fireblocks-mcp/actions/workflows/release.yml/badge.svg)](https://github.com/fireblocks/fireblocks-mcp/actions/workflows/release.yml)
[![Coverage](https://codecov.io/gh/fireblocks/fireblocks-mcp/branch/main/graph/badge.svg)](https://codecov.io/gh/fireblocks/fireblocks-mcp)
[![NPM Version](https://badge.fury.io/js/%40fireblocks%2Fmcp-server.svg)](https://badge.fury.io/js/%40fireblocks%2Fmcp-server)

A Model Context Protocol (MCP) server implementation for the Fireblocks API, enabling AI assistants to interact with Fireblocks services through a standardized protocol.

## Overview

This MCP server provides secure access to Fireblocks functionality, allowing AI assistants to:

- Retrieve and manage vault accounts and assets
- Query and create transactions
- Access exchange account information
- Manage network connections and policies
- Query blockchain information and whitelisted IP addresses

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Fireblocks API credentials (API Key and Private Key)

## Usage

### Running with MCP Clients

The Fireblocks MCP server can be integrated with various MCP-compatible clients. Here are configuration example for popular clients:

#### Using the Published NPM Package

```json
{
  "mcpServers": {
    "fireblocks": {
      "command": "npx",
      "args": ["-y", "@fireblocks/mcp-server"],
      "env": {
        "FIREBLOCKS_API_KEY": "your-api-key",
        "FIREBLOCKS_PRIVATE_KEY_PATH": "/path/to/private-key.pem"
      }
    }
  }
}
```

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
        "fireblocks/mcp-server"
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
  fireblocks/mcp-server
```

Or use an environment file:

```bash
docker run --rm -i \
  --env-file .env \
  -v /path/to/your/private-key.pem:/keys/private-key.pem:ro \
  @fireblocks/mcp-server
```

#### For local global installation:

```bash
npm install -g @fireblocks/mcp-server
fireblocks-mcp
```

## Configuration

The MCP server requires Fireblocks API credentials to be configured via environment variables.

### Required Environment Variables

Create a `.env` file in your project root or set the following environment variables:

```bash
# Required: Fireblocks API Key
FIREBLOCKS_API_KEY=your-api-key-here

# Required: Private Key (choose one method)
# Method 1: Path to private key file
FIREBLOCKS_PRIVATE_KEY_PATH=/path/to/your/private-key.pem

# Method 2: Private key content directly (escape newlines as \n)
FIREBLOCKS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXYZ..."

# Optional: API Base URL (defaults to https://api.fireblocks.io/v2)
FIREBLOCKS_API_BASE_URL=https://api.fireblocks.io/v2
```

### Private Key Setup

You can provide your Fireblocks private key in two ways:

1. **File path** (recommended for security): Set `FIREBLOCKS_PRIVATE_KEY_PATH` to the path of your private key file
2. **Environment variable**: Set `FIREBLOCKS_PRIVATE_KEY` with the private key content (use `\n` for line breaks)

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
- `limit` (optional): Number of results (1-500, default: 200)
- `sourceType` (optional): Source type (VAULT_ACCOUNT, EXCHANGE_ACCOUNT, etc.)
- `sourceId` (optional): Source ID
- `destType` (optional): Destination type
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
- `limit` (optional): Number of results (1-500, default: 200)

#### `get_vault_account_by_id`

Get details of a specific vault account by ID.

#### `get_vault_account_asset`

Get asset information for a specific vault account.

#### `get_vault_balance_by_asset`

Get vault balance information for a specific asset.

### Exchange Management

#### `get_exchange_accounts`

Retrieve exchange accounts with pagination.

**Parameters:**

- `limit` (optional): Number of results per page (1-5, default: 3)
- `before` (optional): Pagination cursor for previous results
- `after` (optional): Pagination cursor for next results

### Network & Policy

#### `get_network_connections`

Retrieve network connection information.

#### `get_active_policy`

Get the currently active policy configuration.

### Blockchain Information

#### `get_blockchains`

Retrieve information about supported blockchains.

#### `get_blockchain_asset`

Get asset information for a specific blockchain.

### Security

#### `get_whitelist_ip_addresses`

Retrieve whitelisted IP addresses.

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
