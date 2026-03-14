type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const PRIORITY: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

export interface Logger {
  error(message: string): void;
  warn(message: string): void;
  info(message: string): void;
  debug(message: string): void;
}

export const createLogger = (logLevel: string): Logger => {
  const maxPriority = PRIORITY[logLevel as LogLevel] ?? PRIORITY.info;

  const log = (level: LogLevel, message: string): void => {
    if (PRIORITY[level] <= maxPriority) {
      process.stderr.write(
        `[${new Date().toISOString()}] [${level}] ${message}\n`
      );
    }
  };

  return {
    error: (msg) => log('error', msg),
    warn: (msg) => log('warn', msg),
    info: (msg) => log('info', msg),
    debug: (msg) => log('debug', msg),
  };
};
