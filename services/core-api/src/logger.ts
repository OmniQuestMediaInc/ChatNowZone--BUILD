// WO: WO-INIT-001

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  error?: unknown;
  [key: string]: unknown;
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  return String(error);
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>): void {
    const entry: LogEntry = { ...(meta || {}), level: 'info', message };
    process.stdout.write(JSON.stringify(entry) + '\n');
  },
  warn(message: string, meta?: Record<string, unknown>): void {
    const entry: LogEntry = { ...(meta || {}), level: 'warn', message };
    process.stdout.write(JSON.stringify(entry) + '\n');
  },
  error(message: string, error?: unknown, meta?: Record<string, unknown>): void {
    const entry: LogEntry = {
      ...(meta || {}),
      level: 'error',
      message,
      ...(error !== undefined ? { error: formatError(error) } : {}),
    };
    process.stderr.write(JSON.stringify(entry) + '\n');
  },
  debug(message: string, meta?: Record<string, unknown>): void {
    if (process.env.LOG_LEVEL === 'debug') {
      const entry: LogEntry = { ...(meta || {}), level: 'debug', message };
      process.stdout.write(JSON.stringify(entry) + '\n');
    }
  },
};
