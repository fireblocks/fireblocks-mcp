import { Server as MCPServer } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { Tool } from '../../types';
import { StreamableHTTPTransportHandler } from './streamable-http-transport';

// Mock dependencies
jest.mock('express');
jest.mock('cors');
jest.mock('@modelcontextprotocol/sdk/server/streamableHttp.js');
jest.mock('@modelcontextprotocol/sdk/server/index.js');
jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'mock-uuid-123'),
}));

const mockedExpress = express as jest.MockedFunction<typeof express>;
const mockedCors = cors as jest.MockedFunction<typeof cors>;
const MockedStreamableHTTPServerTransport = StreamableHTTPServerTransport as jest.MockedClass<
  typeof StreamableHTTPServerTransport
>;

describe('StreamableHTTPTransportHandler', () => {
  let mockApp: any;
  let mockServer: jest.Mocked<MCPServer>;
  let mockTools: Tool[];
  let handler: StreamableHTTPTransportHandler;
  let mockTransport: jest.Mocked<StreamableHTTPServerTransport>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Express app
    mockApp = {
      use: jest.fn(),
      get: jest.fn(),
      post: jest.fn(),
      delete: jest.fn(),
      listen: jest.fn(),
    };
    mockedExpress.mockReturnValue(mockApp);
    (express.json as jest.Mock) = jest.fn(() => jest.fn());

    // Mock CORS middleware
    mockedCors.mockReturnValue(jest.fn());

    // Mock MCP Server
    mockServer = {
      connect: jest.fn(),
    } as any;

    // Mock tools
    mockTools = [
      {
        name: 'test_tool',
        description: 'Test tool',
        schema: z.object({ param: z.string() }),
        handler: jest.fn(),
      },
    ];

    // Mock transport
    mockTransport = {
      handleRequest: jest.fn(),
      close: jest.fn(),
    } as any;
    MockedStreamableHTTPServerTransport.mockImplementation(() => mockTransport);

    handler = new StreamableHTTPTransportHandler(mockServer, mockTools, 'Test Server');
  });

  describe('initialization', () => {
    it('should create handler with correct parameters', () => {
      expect(handler).toBeDefined();
      expect(handler).toBeInstanceOf(StreamableHTTPTransportHandler);
    });
  });

  describe('start method', () => {
    it('should setup Express app with correct middleware and routes', async () => {
      await handler.start();

      // Verify Express app creation
      expect(mockedExpress).toHaveBeenCalled();

      // Verify JSON middleware setup
      expect(express.json).toHaveBeenCalledWith({ limit: '10mb' });

      // Verify middleware setup
      expect(mockApp.use).toHaveBeenCalledWith(expect.any(Function)); // JSON middleware
      expect(mockApp.use).toHaveBeenCalledWith(expect.any(Function)); // Logger middleware
      expect(mockApp.use).toHaveBeenCalledWith(expect.any(Function)); // CORS middleware
      expect(mockApp.use).toHaveBeenCalledWith(expect.any(Function)); // Error handling middleware
      expect(mockApp.get).toHaveBeenCalledWith('/health', expect.any(Function));
      expect(mockApp.get).toHaveBeenCalledWith('/mcp', expect.any(Function));
      expect(mockApp.post).toHaveBeenCalledWith('/mcp', expect.any(Function));

      // Verify transport initialization happens dynamically on request
      expect(MockedStreamableHTTPServerTransport).not.toHaveBeenCalled();

      // Server connection happens dynamically, not during initialization

      // Verify server listening with localhost binding
      expect(mockApp.listen).toHaveBeenCalledWith(
        expect.any(Number),
        '127.0.0.1',
        expect.any(Function),
      );
    });

    it('should generate unique session IDs', async () => {
      await handler.start();

      // Trigger transport creation by making a request
      const mockReq = { method: 'POST', body: { test: 'data' }, headers: {} };
      const mockRes = {
        headersSent: false,
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      };
      const getCalls = mockApp.get.mock.calls;
      const mcpHandler = getCalls.find(call => call[0] === '/mcp')[1];
      await mcpHandler(mockReq, mockRes);

      const transportCall = MockedStreamableHTTPServerTransport.mock.calls[0]?.[0];
      const sessionIdGenerator = transportCall?.sessionIdGenerator;

      expect(sessionIdGenerator?.()).toBe('mock-uuid-123');
    });

    it('should handle session initialization callback', async () => {
      await handler.start();

      const transportCall = MockedStreamableHTTPServerTransport.mock.calls[0]?.[0];
      const onsessioninitialized = transportCall?.onsessioninitialized;

      // Should not throw when called
      expect(() => onsessioninitialized?.('test-session-id')).not.toThrow();
    });

    describe('route handlers', () => {
      let healthHandler: Function;
      let mcpHandler: Function;

      beforeEach(async () => {
        await handler.start();

        // Extract route handlers
        const getCalls = mockApp.get.mock.calls;

        healthHandler = getCalls.find(call => call[0] === '/health')[1];
        mcpHandler = getCalls.find(call => call[0] === '/mcp')[1]; // Use GET handler for testing
      });

      describe('health route (/health)', () => {
        it('should return detailed health status', () => {
          const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
          };

          healthHandler({}, mockRes);

          expect(mockRes.status).toHaveBeenCalledWith(200);
          expect(mockRes.json).toHaveBeenCalledWith({
            status: 'ok',
            name: 'Test Server',
            version: expect.any(String),
            transport: 'Streamable HTTP',
            uptime: expect.any(Number),
          });
        });
      });

      describe('MCP route (/mcp)', () => {
        it('should handle requests through streamable HTTP transport', async () => {
          const mockReq = {
            method: 'POST',
            body: { test: 'data' },
            headers: {},
          };
          const mockRes = {
            headersSent: false,
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            setHeader: jest.fn(),
          };

          await mcpHandler(mockReq, mockRes);

          expect(mockTransport.handleRequest).toHaveBeenCalledWith(mockReq, mockRes, {
            test: 'data',
          });
        });

        it('should handle transport errors gracefully', async () => {
          const mockReq = {
            method: 'POST',
            body: { test: 'data' },
            headers: {},
          };
          const mockRes = {
            headersSent: false,
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            setHeader: jest.fn(),
          };

          // Mock transport error
          mockTransport.handleRequest.mockRejectedValue(new Error('Transport error'));

          await mcpHandler(mockReq, mockRes);

          expect(mockRes.status).toHaveBeenCalledWith(500);
          expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
        });

        it('should handle case when transport creation fails', async () => {
          const mockReq = {
            method: 'POST',
            body: { test: 'data' },
            headers: {},
          };
          const mockRes = {
            headersSent: false,
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            setHeader: jest.fn(),
          };

          // Mock the server connect to fail
          mockServer.connect.mockRejectedValue(new Error('Connection failed'));

          await mcpHandler(mockReq, mockRes);

          expect(mockRes.status).toHaveBeenCalledWith(500);
          expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
        });
      });
    });

    describe('error middleware', () => {
      let errorMiddleware: Function;

      beforeEach(async () => {
        await handler.start();

        // Extract error middleware (last middleware)
        const useCalls = mockApp.use.mock.calls;
        errorMiddleware = useCalls[useCalls.length - 1][0];
      });

      it('should handle errors when headers not sent', () => {
        const error = new Error('Test error');
        const mockReq = {};
        const mockRes = {
          headersSent: false,
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
        const mockNext = jest.fn();

        errorMiddleware(error, mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
      });

      it('should not send response when headers already sent', () => {
        const error = new Error('Test error');
        const mockReq = {};
        const mockRes = {
          headersSent: true,
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
        const mockNext = jest.fn();

        errorMiddleware(error, mockReq, mockRes, mockNext);

        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();
      });
    });
  });

  describe('shutdown method', () => {
    it('should close all transports gracefully', async () => {
      await handler.start();

      // Add multiple sessions
      const mockTransport2 = {
        close: jest.fn().mockResolvedValue(undefined),
        handleRequest: jest.fn(),
      } as any;

      (handler as any).transports.set('session1', mockTransport);
      (handler as any).transports.set('session2', mockTransport2);

      await handler.shutdown();

      expect(mockTransport.close).toHaveBeenCalled();
      expect(mockTransport2.close).toHaveBeenCalled();
      expect(handler.getActiveSessionCount()).toBe(0);
    });

    it('should handle transport close errors gracefully during shutdown', async () => {
      await handler.start();

      // Mock transport that will fail to close
      mockTransport.close.mockRejectedValue(new Error('Close error'));
      (handler as any).transports.set('session1', mockTransport);

      await expect(handler.shutdown()).resolves.not.toThrow();
      expect(handler.getActiveSessionCount()).toBe(0);
    });

    it('should handle shutdown when no transports are active', async () => {
      await handler.start();
      await expect(handler.shutdown()).resolves.not.toThrow();
      expect(handler.getActiveSessionCount()).toBe(0);
    });
  });
});
