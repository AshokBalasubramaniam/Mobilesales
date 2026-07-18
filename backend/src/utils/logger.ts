type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const levels: LogLevel[] = ['error', 'warn', 'info', 'debug'];

const timestamp = (): string => new Date().toISOString();

const build = (level: LogLevel) => (message: string, meta?: unknown): void => {
  const line = `[${timestamp()}] [${level.toUpperCase()}] ${message}`;
  const out = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  if (meta !== undefined) {
    out(line, meta);
  } else {
    out(line);
  }
};

type Logger = Record<LogLevel, (message: string, meta?: unknown) => void>;

const logger = {} as Logger;
levels.forEach((level) => {
  logger[level] = build(level);
});

export default logger;
