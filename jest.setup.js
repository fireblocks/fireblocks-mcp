// Jest setup file for global test configuration

// Extend Jest matchers if needed
// import 'jest-extended';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods if needed for cleaner test output
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// Global test utilities
global.testUtils = {
  // Add any global test utilities here
};

// Setup environment variables for tests
process.env.NODE_ENV = 'test';

// Add any global mocks or setup here
beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up after each test
  jest.restoreAllMocks();
}); 