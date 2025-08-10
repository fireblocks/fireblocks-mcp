import { Server as MCPServer } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express, { NextFunction, Request, Response } from 'express';
// @ts-ignore - cors module doesn't have types
import cors from 'cors';
import { randomUUID } from 'crypto';
import packageJson from '../../../package.json';
import { Tool } from '../../types';
import { logger } from '../../utils';

const SESSION_ID_HEADER = 'mcp-session-id';

export class StreamableHTTPTransportHandler {
  private server: MCPServer;
  private tools: Tool[];
  private name: string;
  private transports: Map<string, StreamableHTTPServerTransport> = new Map();

  constructor(server: MCPServer, tools: Tool[], name: string) {
    this.server = server;
    this.tools = tools;
    this.name = name;
  }

  public async start() {
    const app = express();

    app.use(express.json({ limit: '10mb' }));

    // Logger middleware
    app.use((req, res, next) => {
      const sessionId = req.headers[SESSION_ID_HEADER] as string;
      const metadata =
        req.body && req.body.jsonrpc
          ? {
              id: req.body.id,
              method: req.body.method,
              name: req.body.params?.name,
              args: req.body.params?.arguments,
              sessionId,
            }
          : undefined;
      logger.info(`${req.method} ${req.url}`, metadata);
      next();
    });

    // CORS middleware for security
    app.use(
      cors({
        origin: process.env.CORS_ORIGIN || '*',
        exposedHeaders: [SESSION_ID_HEADER],
      }),
    );

    // Helper function to create and setup a new transport for a session
    const createTransportForSession = async (sessionId: string) => {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => sessionId, // Use the provided session ID
        enableJsonResponse: false, // Prefer SSE streams
        onsessioninitialized: initSessionId => {
          logger.info(`New MCP session initialized: ${initSessionId}`);
        },
      });

      // Set up automatic cleanup when transport closes
      transport.onclose = () => {
        if (this.transports.has(sessionId)) {
          this.transports.delete(sessionId);
          logger.debug(
            `Transport for session ${sessionId} closed and removed from active sessions`,
          );
        }
      };

      // Connect the MCP server to the transport
      await this.server.connect(transport);

      // Store the transport in our map
      this.transports.set(sessionId, transport);

      return transport;
    };

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'ok',
        name: this.name,
        version: packageJson.version,
        transport: 'Streamable HTTP',
        uptime: Math.floor(process.uptime()),
      });
    });

    // Main MCP endpoint - handles both GET and POST requests
    const mcpHandler = async (req: Request, res: Response): Promise<void> => {
      try {
        // Extract session ID from headers or create a new one
        let sessionId = req.headers?.[SESSION_ID_HEADER] as string;

        if (!sessionId) {
          sessionId = randomUUID();
          res.setHeader(SESSION_ID_HEADER, sessionId);
        }

        // Get or create transport for this session
        let transport = this.transports.get(sessionId);
        if (!transport) {
          transport = await createTransportForSession(sessionId);
        }

        // Handle the request through the session-specific transport
        await transport.handleRequest(req, res, req.body);
      } catch (error) {
        logger.error('Error handling MCP request:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Internal server error' });
        }
      }
    };

    // Session termination endpoint
    app.delete('/mcp', async (req: Request, res: Response) => {
      const sessionId = req.headers?.['mcp-session-id'] as string;

      if (!sessionId) {
        res.status(400).json({ error: 'Session ID required for termination' });
        return;
      }

      try {
        await this.removeSession(sessionId);
        res.status(200).json({ message: 'Session terminated successfully' });
      } catch (error) {
        logger.error(`Error terminating session ${sessionId}:`, error);
        res.status(500).json({ error: 'Failed to terminate session' });
      }
    });

    app.get('/mcp', mcpHandler);
    app.post('/mcp', mcpHandler);

    // Error handling middleware
    app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
      logger.error(`[${this.name} Error]: ${err.message}`, err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    const port = parseInt(process.env.PORT || '3000');
    const host = process.env.HOST || '127.0.0.1';

    app.listen(port, host, () => {
      logger.info(
        `${this.name} running on Streamable HTTP transport at http://${host}:${port}/mcp`,
      );
    });
  }

  /**
   * Gracefully shutdown all transports
   */
  public async shutdown() {
    logger.info(`Shutting down ${this.transports.size} active connections...`);

    const shutdownPromises = Array.from(this.transports.values()).map(async transport => {
      try {
        await transport.close();
      } catch (error) {
        logger.error('Error closing transport:', error);
      }
    });

    await Promise.allSettled(shutdownPromises);
    this.transports.clear();
    logger.info(`${this.name} Streamable HTTP transport shut down`);
  }

  /**
   * Remove a session and close its transport
   */
  public async removeSession(sessionId: string) {
    const transport = this.transports.get(sessionId);
    if (transport) {
      try {
        await transport.close();
        this.transports.delete(sessionId);
        logger.info(`Session ${sessionId} removed and transport closed`);
      } catch (error) {
        logger.error(`Error closing transport for session ${sessionId}:`, error);
      }
    }
  }

  /**
   * Get the number of active sessions
   */
  public getActiveSessionCount(): number {
    return this.transports.size;
  }
}
