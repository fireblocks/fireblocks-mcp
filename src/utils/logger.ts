enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

const logLevel: LogLevel =
  (LogLevel[process.env.LOGGER_LEVEL as keyof typeof LogLevel] as LogLevel) || LogLevel.INFO;

function isLogLevelEnabled(level: LogLevel): boolean {
  const levels = {
    [LogLevel.DEBUG]: 0,
    [LogLevel.INFO]: 1,
    [LogLevel.WARN]: 2,
    [LogLevel.ERROR]: 3,
  };
  return levels[logLevel] <= levels[level];
}

function log(
  level: LogLevel,
  message: string,
  metadata?: Record<string, unknown>,
  error?: Error | unknown,
) {
  if (!isLogLevelEnabled(level)) return;

  const timestamp = new Date().toISOString();

  // Use stderr for all levels to avoid conflicts with mcp stdio
  process.stderr.write(
    `[${timestamp}] [${level}] ${message} ${metadata ? JSON.stringify(metadata, null, 2) : ''}\n`,
  );

  if (error instanceof Error) {
    process.stderr.write(`${error.stack}\n`);
  }
}

export interface Logger {
  debug(message: string, metadata?: Record<string, unknown>): void;
  info(message: string, metadata?: Record<string, unknown>): void;
  warn(message: string, error?: Error | unknown, metadata?: Record<string, unknown>): void;
  error(message: string, error: Error | unknown, metadata?: Record<string, unknown>): void;
}

export const logger: Logger = {
  debug: (message: string, metadata?: Record<string, unknown>) => {
    log(LogLevel.DEBUG, message, metadata);
  },
  info: (message: string, metadata?: Record<string, unknown>) => {
    log(LogLevel.INFO, message, metadata);
  },
  warn: (message: string, error?: Error | unknown, metadata?: Record<string, unknown>) => {
    log(LogLevel.WARN, message, metadata, error);
  },
  error: (message: string, error: Error | unknown, metadata?: Record<string, unknown>) => {
    log(LogLevel.ERROR, message, metadata, error);
  },
};
