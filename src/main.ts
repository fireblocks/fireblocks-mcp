#!/usr/bin/env node

import { Server } from './server';
import { tools } from './tools';
import { logger } from './utils';

const mcpType = process.env.MCP_TRANSPORT_TYPE || process.argv[2] || 'stdio';

const server = new Server();
server.registerTools(tools);

server.run(mcpType === 'sse').catch(err => {
  logger.error('Server error', err);
});
