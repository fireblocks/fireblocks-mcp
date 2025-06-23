import { Server as MCPServer } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StdioTransportHandler } from './stdio-transport';

// Mock dependencies
jest.mock('@modelcontextprotocol/sdk/server/stdio.js');
jest.mock('@modelcontextprotocol/sdk/server/index.js');

const MockedStdioServerTransport = StdioServerTransport as jest.MockedClass<
  typeof StdioServerTransport
>;

describe('StdioTransportHandler', () => {
  let mockServer: jest.Mocked<MCPServer>;
  let handler: StdioTransportHandler;
  let mockTransport: jest.Mocked<StdioServerTransport>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock MCP Server
    mockServer = {
      connect: jest.fn(),
    } as any;

    // Mock transport
    mockTransport = {
      onmessage: null,
      onerror: null,
    } as any;
    MockedStdioServerTransport.mockImplementation(() => mockTransport);

    handler = new StdioTransportHandler(mockServer, 'Test Server');
  });

  describe('initialization', () => {
    it('should create handler with correct parameters', () => {
      expect(handler).toBeDefined();
      expect(handler).toBeInstanceOf(StdioTransportHandler);
    });
  });

  describe('start method', () => {
    it('should create stdio transport and connect server', async () => {
      await handler.start();

      // Verify transport creation
      expect(MockedStdioServerTransport).toHaveBeenCalled();

      // Verify server connection
      expect(mockServer.connect).toHaveBeenCalledWith(mockTransport);
    });

    it('should setup transport event handlers', async () => {
      await handler.start();

      // Verify event handlers are set
      expect(mockTransport.onmessage).toBeInstanceOf(Function);
      expect(mockTransport.onerror).toBeInstanceOf(Function);
    });

    it('should handle transport messages', async () => {
      await handler.start();

      const testMessage = { type: 'test', data: 'test message' };
      const messageHandler = mockTransport.onmessage;

      // Test that message handler doesn't throw when it exists
      if (messageHandler) {
        expect(() => messageHandler(testMessage as any)).not.toThrow();
      }
    });

    it('should handle transport errors', async () => {
      await handler.start();

      const testError = new Error('Transport error');
      const errorHandler = mockTransport.onerror;

      // Test that error handler doesn't throw when it exists
      if (errorHandler) {
        expect(() => errorHandler(testError)).not.toThrow();
      }
    });

    it('should handle server connection errors', async () => {
      const connectionError = new Error('Connection failed');
      mockServer.connect.mockRejectedValue(connectionError);

      await expect(handler.start()).rejects.toThrow('Connection failed');
    });
  });
});
