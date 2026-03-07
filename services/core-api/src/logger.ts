// WO: WO-INIT-001

export const logger = {
  error: (message: string, meta?: Record<string, unknown>): void => {
    const timestamp = new Date().toISOString();
    process.stderr.write(
      JSON.stringify({ level: 'error', message, ...meta, timestamp }) + '\n',
    );
  },
  info: (message: string, meta?: Record<string, unknown>): void => {
    const timestamp = new Date().toISOString();
    process.stdout.write(
      JSON.stringify({ level: 'info', message, ...meta, timestamp }) + '\n',
    );
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
    const entry: LogEntry = { level: 'info', message, ...meta };
    process.stdout.write(JSON.stringify(entry) + '\n');
  },
  warn(message: string, meta?: Record<string, unknown>): void {
    const entry: LogEntry = { level: 'warn', message, ...meta };
    process.stdout.write(JSON.stringify(entry) + '\n');
  },
  error(message: string, error?: unknown, meta?: Record<string, unknown>): void {
    const entry: LogEntry = {
      level: 'error',
      message,
      ...(error !== undefined ? { error: formatError(error) } : {}),
      ...meta,
    };
    process.stderr.write(JSON.stringify(entry) + '\n');
  },
  debug(message: string, meta?: Record<string, unknown>): void {
    if (process.env.LOG_LEVEL === 'debug') {
      const entry: LogEntry = { level: 'debug', message, ...meta };
      process.stdout.write(JSON.stringify(entry) + '\n');
    }
  },
};
