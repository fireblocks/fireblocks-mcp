import { Server as MCPServer } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  TextContent,
} from '@modelcontextprotocol/sdk/types.js';
import { Tool } from '../types';
import { convertZodToJsonSchema, logger } from '../utils';
import { errorHandling } from './error-handlling';
import { SSETransportHandler, StdioTransportHandler } from './transports';

import packageJson from '../../package.json';

export class Server {
  private readonly name: string;
  private server: MCPServer;
  private tools: Tool[] = [];

  constructor() {
    this.name = 'Fireblocks MCP Server';
    this.server = new MCPServer(
      {
        name: this.name,
        version: packageJson.version,
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );
  }

  private setupErrorHandling() {
    this.server.onerror = error => {
      logger.error(`[${this.name} Error]: ${error.message}`, error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  public registerTools(tools: Tool[]) {
    this.tools.push(...tools);
  }

  private setupRequestHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = this.tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: convertZodToJsonSchema(tool.schema),
      }));

      return {
        tools,
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async request => {
      const tool = this.tools.find(t => t.name === request.params.name);
      if (!tool) {
        throw new Error(`Tool not found: ${request.params.name}`);
      }

      return this.handleToolCall(tool, request.params.arguments);
    });
  }

  private async handleToolCall(tool: Tool, args: unknown) {
    try {
      logger.debug(`Handling ${tool.name} tool`, { args });
      const parsedArgs = tool.schema.parse(args);

      const result = await tool.handler(parsedArgs);

      const content: TextContent = {
        type: 'text',
        text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
      };

      return {
        content: [content],
      };
    } catch (error: any) {
      const mcpError = errorHandling(error);
      logger.error(
        `Error in ${tool.name} tool: ${mcpError.message}`,
        [ErrorCode.InvalidRequest, ErrorCode.InvalidParams].includes(mcpError.code)
          ? undefined
          : error,
      );

      const errorContent: TextContent = {
        type: 'text',
        text: mcpError.message,
      };

      return {
        content: [errorContent],
        isError: true,
      };
    }
  }

  public async run(useSse: boolean = false) {
    this.setupErrorHandling();
    this.setupRequestHandlers();

    try {
      if (useSse) {
        const sseHandler = new SSETransportHandler(this.server, this.tools, this.name);
        await sseHandler.start();
      } else {
        const stdioHandler = new StdioTransportHandler(this.server, this.name);
        await stdioHandler.start();
      }
    } catch (error) {
      logger.error(`Unexpected error starting ${this.name}`, error);
      process.exit(1);
    }
  }
}
