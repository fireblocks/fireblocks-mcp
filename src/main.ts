#!/usr/bin/env node

import { Server } from './server';
import { tools } from './tools';
import { logger } from './utils';
import { TransportType } from './types';

const mcpTransportType = (process.env.MCP_TRANSPORT_TYPE ||
  process.argv[2] ||
  'stdio') as TransportType;

const server = new Server();
server.registerTools(tools);

server.run(mcpTransportType).catch(err => {
  logger.error('Server error', err);
});
