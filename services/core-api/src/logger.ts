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
    process.stderr.write(
      JSON.stringify({ level: 'info', message, ...meta, timestamp }) + '\n',
    );
  },
};
