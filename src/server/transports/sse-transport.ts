import { Server as MCPServer } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express, { NextFunction, Request, Response } from 'express';
import packageJson from '../../../package.json';
import { Tool } from '../../types';
import { convertZodToJsonSchema, logger } from '../../utils';

export class SSETransportHandler {
  private server: MCPServer;
  private tools: Tool[];
  private name: string;

  constructor(server: MCPServer, tools: Tool[], name: string) {
    this.server = server;
    this.tools = tools;
    this.name = name;
  }

  public async start() {
    const app = express();

    // Logger middleware
    app.use((req, res, next) => {
      logger.info(`${req.method} ${req.url}`);
      next();
    });

    let transport: SSEServerTransport;

    app.get('/', (req, res) => {
      const serverDetails = {
        name: this.name,
        version: packageJson.version,
        transport: 'SSE',
        capabilities: {
          tools: true,
        },
        toolCount: this.tools.length,
        tools: this.tools.map(tool => ({
          name: tool.name,
          description: tool.description,
          schema: convertZodToJsonSchema(tool.schema),
        })),
      };
      res.status(200).json(serverDetails);
    });

    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'ok',
        name: this.name,
        version: packageJson.version,
        transport: 'SSE',
      });
    });

    app.get('/sse', async (req, res) => {
      transport = new SSEServerTransport('/messages', res);
      await this.server.connect(transport);
    });

    app.post('/messages', async (req, res) => {
      // Note: to support multiple simultaneous connections, these messages will
      // need to be routed to a specific matching transport. (This logic isn't
      // implemented here, for simplicity.)
      if (transport) {
        await transport.handlePostMessage(req, res);
      }
    });

    // Error handling middleware
    app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
      logger.error(`[${this.name} Error]: ${err.message}`, err);
      res.status(500).send('Internal Server Error');
    });

    const port = parseInt(process.env.PORT || '3000');
    app.listen(port);
    logger.info(`${this.name} running on SSE port ${port}`);
  }
}
