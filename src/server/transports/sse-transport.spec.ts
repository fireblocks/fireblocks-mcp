import { Server as MCPServer } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express from 'express';
import { z } from 'zod';
import { Tool } from '../../types';
import { SSETransportHandler } from './sse-transport';

// Mock dependencies
jest.mock('express');
jest.mock('@modelcontextprotocol/sdk/server/sse.js');
jest.mock('@modelcontextprotocol/sdk/server/index.js');

const mockedExpress = express as jest.MockedFunction<typeof express>;
const MockedSSEServerTransport = SSEServerTransport as jest.MockedClass<typeof SSEServerTransport>;

describe('SSETransportHandler', () => {
  let mockApp: any;
  let mockServer: jest.Mocked<MCPServer>;
  let mockTools: Tool[];
  let handler: SSETransportHandler;
  let mockTransport: jest.Mocked<SSEServerTransport>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Express app
    mockApp = {
      use: jest.fn(),
      get: jest.fn(),
      post: jest.fn(),
      listen: jest.fn(),
    };
    mockedExpress.mockReturnValue(mockApp);

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
      handlePostMessage: jest.fn(),
    } as any;
    MockedSSEServerTransport.mockImplementation(() => mockTransport);

    handler = new SSETransportHandler(mockServer, mockTools, 'Test Server');
  });

  describe('initialization', () => {
    it('should create handler with correct parameters', () => {
      expect(handler).toBeDefined();
      expect(handler).toBeInstanceOf(SSETransportHandler);
    });
  });

  describe('start method', () => {
    it('should setup Express app with correct middleware and routes', async () => {
      await handler.start();

      // Verify Express app creation
      expect(mockedExpress).toHaveBeenCalled();

      // Verify middleware setup
      expect(mockApp.use).toHaveBeenCalledWith(expect.any(Function)); // Logger middleware
      expect(mockApp.use).toHaveBeenCalledWith(expect.any(Function)); // Error handling middleware

      // Verify routes setup
      expect(mockApp.get).toHaveBeenCalledWith('/', expect.any(Function));
      expect(mockApp.get).toHaveBeenCalledWith('/health', expect.any(Function));
      expect(mockApp.get).toHaveBeenCalledWith('/sse', expect.any(Function));
      expect(mockApp.post).toHaveBeenCalledWith('/messages', expect.any(Function));

      // Verify server listening with default port
      expect(mockApp.listen).toHaveBeenCalledWith(expect.any(Number));
    });

    describe('route handlers', () => {
      let rootHandler: Function;
      let healthHandler: Function;
      let sseHandler: Function;
      let messagesHandler: Function;

      beforeEach(async () => {
        await handler.start();

        // Extract route handlers
        const getCalls = mockApp.get.mock.calls;
        const postCalls = mockApp.post.mock.calls;

        rootHandler = getCalls.find(call => call[0] === '/')[1];
        healthHandler = getCalls.find(call => call[0] === '/health')[1];
        sseHandler = getCalls.find(call => call[0] === '/sse')[1];
        messagesHandler = postCalls.find(call => call[0] === '/messages')[1];
      });

      describe('root route (/)', () => {
        it('should return server details', () => {
          const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
          };

          rootHandler({}, mockRes);

          expect(mockRes.status).toHaveBeenCalledWith(200);
          expect(mockRes.json).toHaveBeenCalledWith({
            name: 'Test Server',
            version: expect.any(String),
            transport: 'SSE',
            capabilities: {
              tools: true,
            },
            toolCount: 1,
            tools: [
              {
                name: 'test_tool',
                description: 'Test tool',
                schema: expect.any(Object),
              },
            ],
          });
        });
      });

      describe('health route (/health)', () => {
        it('should return health status', () => {
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
            transport: 'SSE',
          });
        });
      });

      describe('SSE route (/sse)', () => {
        it('should create transport and connect server', async () => {
          const mockRes = {};

          await sseHandler({}, mockRes);

          expect(MockedSSEServerTransport).toHaveBeenCalledWith('/messages', mockRes);
          expect(mockServer.connect).toHaveBeenCalledWith(mockTransport);
        });
      });

      describe('messages route (/messages)', () => {
        it('should handle post messages when transport exists', async () => {
          const mockReq = {};
          const mockRes = {};

          // First setup SSE to create transport
          await sseHandler({}, {});

          await messagesHandler(mockReq, mockRes);

          expect(mockTransport.handlePostMessage).toHaveBeenCalledWith(mockReq, mockRes);
        });

        it('should handle case when transport does not exist', async () => {
          const mockReq = {};
          const mockRes = {};

          // Don't setup SSE, so transport should be undefined
          await messagesHandler(mockReq, mockRes);

          expect(mockTransport.handlePostMessage).not.toHaveBeenCalled();
        });
      });
    });

    describe('middleware', () => {
      let loggerMiddleware: Function;
      let errorMiddleware: Function;

      beforeEach(async () => {
        await handler.start();

        // Extract middleware
        const useCalls = mockApp.use.mock.calls;
        loggerMiddleware = useCalls[0][0]; // First middleware (logger)
        errorMiddleware = useCalls[1][0]; // Second middleware (error handler)
      });

      describe('logger middleware', () => {
        it('should log requests', () => {
          const mockReq = { method: 'GET', url: '/test' };
          const mockRes = {};
          const mockNext = jest.fn();

          loggerMiddleware(mockReq, mockRes, mockNext);

          expect(mockNext).toHaveBeenCalled();
        });
      });

      describe('error middleware', () => {
        it('should handle errors', () => {
          const error = new Error('Test error');
          const mockReq = {};
          const mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
          };
          const mockNext = jest.fn();

          errorMiddleware(error, mockReq, mockRes, mockNext);

          expect(mockRes.status).toHaveBeenCalledWith(500);
          expect(mockRes.send).toHaveBeenCalledWith('Internal Server Error');
        });
      });
    });
  });
});
