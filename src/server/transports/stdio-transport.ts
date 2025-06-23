import { Server as MCPServer } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { logger } from '../../utils';

export class StdioTransportHandler {
  private server: MCPServer;
  private name: string;

  constructor(server: MCPServer, name: string) {
    this.server = server;
    this.name = name;
  }

  public async start() {
    const transport = new StdioServerTransport();

    transport.onmessage = message => {
      logger.debug(`[${this.name} Transport Message]: ${message}`, {
        message: message as any,
      });
    };

    transport.onerror = error => {
      logger.error(`[${this.name} Transport Error]: ${error.message}`, error);
    };

    logger.info(`${this.name} running on stdio`);
    await this.server.connect(transport);
  }
}
