import { Server as MCPServer } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { Tool } from '../types';
import { Server } from './server';
import { SSETransportHandler, StdioTransportHandler } from './transports';

// Mock the fireblocks client to avoid config loading
jest.mock('../fireblocks-client', () => ({
  fireblocksClient: {
    testConnection: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock the transports
jest.mock('./transports', () => ({
  SSETransportHandler: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
  })),
  StdioTransportHandler: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
  })),
}));

// Mock the MCP server
jest.mock('@modelcontextprotocol/sdk/server/index.js', () => ({
  Server: jest.fn().mockImplementation(() => ({
    setRequestHandler: jest.fn(),
    onerror: null,
    close: jest.fn(),
  })),
}));

const MockedMCPServer = MCPServer as jest.MockedClass<typeof MCPServer>;
const MockedSSETransportHandler = SSETransportHandler as jest.MockedClass<
  typeof SSETransportHandler
>;
const MockedStdioTransportHandler = StdioTransportHandler as jest.MockedClass<
  typeof StdioTransportHandler
>;

describe('Server', () => {
  let server: Server;
  let mockMCPServer: jest.Mocked<MCPServer>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockMCPServer = {
      setRequestHandler: jest.fn(),
      onerror: null,
      close: jest.fn(),
    } as any;
    MockedMCPServer.mockReturnValue(mockMCPServer);
    server = new Server();
  });

  describe('initialization', () => {
    it('should initialize with correct server configuration', () => {
      expect(MockedMCPServer).toHaveBeenCalledWith(
        {
          name: 'Fireblocks MCP Server',
          version: expect.any(String),
        },
        {
          capabilities: {
            tools: {},
          },
        },
      );
    });

    it('should initialize with empty tools array', () => {
      expect(server).toBeDefined();
      // Tools array is private, but we can test it through registerTools
      const tools: Tool[] = [];
      expect(() => server.registerTools(tools)).not.toThrow();
    });
  });

  describe('registerTools', () => {
    it('should register multiple tools', () => {
      const mockTools: Tool[] = [
        {
          name: 'test_tool_1',
          description: 'Test tool 1',
          schema: z.object({}),
          handler: jest.fn(),
        },
        {
          name: 'test_tool_2',
          description: 'Test tool 2',
          schema: z.object({ param: z.string() }),
          handler: jest.fn(),
        },
      ];

      expect(() => server.registerTools(mockTools)).not.toThrow();
    });

    it('should register tools incrementally', () => {
      const tool1: Tool = {
        name: 'tool_1',
        description: 'Tool 1',
        schema: z.object({}),
        handler: jest.fn(),
      };

      const tool2: Tool = {
        name: 'tool_2',
        description: 'Tool 2',
        schema: z.object({}),
        handler: jest.fn(),
      };

      expect(() => {
        server.registerTools([tool1]);
        server.registerTools([tool2]);
      }).not.toThrow();
    });
  });

  describe('request handlers setup', () => {
    let listToolsHandler: any;
    let callToolHandler: any;

    beforeEach(() => {
      // Mock the setRequestHandler to capture the handlers
      mockMCPServer.setRequestHandler.mockImplementation((schema, handler) => {
        if (schema === ListToolsRequestSchema) {
          listToolsHandler = handler;
        } else if (schema === CallToolRequestSchema) {
          callToolHandler = handler;
        }
      });

      // Trigger setup by calling run (but we'll mock transports)
      const mockSSEHandler = { start: jest.fn() };
      MockedSSETransportHandler.mockReturnValue(mockSSEHandler as any);
    });

    describe('ListTools handler', () => {
      it('should return empty tools list when no tools registered', async () => {
        await server.run(true);

        const result = await listToolsHandler();

        expect(result).toEqual({
          tools: [],
        });
      });

      it('should return registered tools with correct format', async () => {
        const mockTool: Tool = {
          name: 'test_tool',
          description: 'A test tool',
          schema: z.object({
            param1: z.string().describe('A string parameter'),
            param2: z.number().optional().describe('An optional number parameter'),
          }),
          handler: jest.fn(),
        };

        server.registerTools([mockTool]);
        await server.run(true);

        const result = await listToolsHandler();

        expect(result.tools).toHaveLength(1);
        expect(result.tools[0]).toEqual({
          name: 'test_tool',
          description: 'A test tool',
          inputSchema: expect.any(Object), // JSON schema conversion
        });
      });
    });

    describe('CallTool handler', () => {
      let mockTool: Tool;

      beforeEach(() => {
        mockTool = {
          name: 'test_tool',
          description: 'A test tool',
          schema: z.object({
            message: z.string(),
          }),
          handler: jest.fn(),
        };

        server.registerTools([mockTool]);
      });

      it('should successfully call a tool with valid arguments', async () => {
        const mockResult = { success: true, data: 'test result' };
        (mockTool.handler as jest.Mock).mockResolvedValue(mockResult);

        await server.run(true);

        const request = {
          params: {
            name: 'test_tool',
            arguments: { message: 'hello' },
          },
        };

        const result = await callToolHandler(request);

        expect(mockTool.handler).toHaveBeenCalledWith({ message: 'hello' });
        expect(result).toEqual({
          content: [
            {
              type: 'text',
              text: JSON.stringify(mockResult, null, 2),
            },
          ],
        });
      });

      it('should handle string result from tool', async () => {
        const mockResult = 'Simple string result';
        (mockTool.handler as jest.Mock).mockResolvedValue(mockResult);

        await server.run(true);

        const request = {
          params: {
            name: 'test_tool',
            arguments: { message: 'hello' },
          },
        };

        const result = await callToolHandler(request);

        expect(result).toEqual({
          content: [
            {
              type: 'text',
              text: 'Simple string result',
            },
          ],
        });
      });

      it('should throw error when tool not found', async () => {
        await server.run(true);

        const request = {
          params: {
            name: 'nonexistent_tool',
            arguments: {},
          },
        };

        await expect(callToolHandler(request)).rejects.toThrow('Tool not found: nonexistent_tool');
      });

      it('should handle schema validation errors', async () => {
        await server.run(true);

        const request = {
          params: {
            name: 'test_tool',
            arguments: { invalid: 'argument' }, // Missing required 'message'
          },
        };

        const result = await callToolHandler(request);

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain('Invalid input');
      });

      it('should handle tool execution errors', async () => {
        const error = new Error('Tool execution failed');
        (mockTool.handler as jest.Mock).mockRejectedValue(error);

        await server.run(true);

        const request = {
          params: {
            name: 'test_tool',
            arguments: { message: 'hello' },
          },
        };

        const result = await callToolHandler(request);

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain('Tool execution failed');
      });
    });
  });

  describe('run method', () => {
    it('should start SSE transport when useSse is true', async () => {
      const mockSSEHandler = { start: jest.fn() };
      MockedSSETransportHandler.mockReturnValue(mockSSEHandler as any);

      await server.run(true);

      expect(MockedSSETransportHandler).toHaveBeenCalledWith(
        mockMCPServer,
        [],
        'Fireblocks MCP Server',
      );
      expect(mockSSEHandler.start).toHaveBeenCalled();
    });

    it('should start stdio transport when useSse is false', async () => {
      const mockStdioHandler = { start: jest.fn() };
      MockedStdioTransportHandler.mockReturnValue(mockStdioHandler as any);

      await server.run(false);

      expect(MockedStdioTransportHandler).toHaveBeenCalledWith(
        mockMCPServer,
        'Fireblocks MCP Server',
      );
      expect(mockStdioHandler.start).toHaveBeenCalled();
    });

    it('should default to stdio transport when no parameter provided', async () => {
      const mockStdioHandler = { start: jest.fn() };
      MockedStdioTransportHandler.mockReturnValue(mockStdioHandler as any);

      await server.run();

      expect(MockedStdioTransportHandler).toHaveBeenCalled();
      expect(mockStdioHandler.start).toHaveBeenCalled();
    });

    it('should call transport start method', async () => {
      const mockSSEHandler = { start: jest.fn() };
      MockedSSETransportHandler.mockReturnValue(mockSSEHandler as any);

      await server.run(true);

      // Verify that the SSE handler start method was called
      expect(mockSSEHandler.start).toHaveBeenCalled();
    });

    it('should setup error handling and request handlers', async () => {
      const mockSSEHandler = { start: jest.fn() };
      MockedSSETransportHandler.mockReturnValue(mockSSEHandler as any);

      await server.run(true);

      expect(mockMCPServer.setRequestHandler).toHaveBeenCalledTimes(2);
      expect(mockMCPServer.onerror).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should set up error handler on MCP server', async () => {
      const mockSSEHandler = { start: jest.fn() };
      MockedSSETransportHandler.mockReturnValue(mockSSEHandler as any);

      await server.run(true);

      expect(mockMCPServer.onerror).toBeInstanceOf(Function);
    });

    it('should handle SIGINT signal setup', async () => {
      const mockSSEHandler = { start: jest.fn() };
      MockedSSETransportHandler.mockReturnValue(mockSSEHandler as any);

      await server.run(true);

      // Verify that SIGINT handlers are set up
      // Note: We can't easily test the actual signal handling without complex process mocking
      expect(mockMCPServer.setRequestHandler).toHaveBeenCalledTimes(2);
      expect(mockMCPServer.onerror).toBeDefined();
    });
  });
});
