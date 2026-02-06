const LOG_LEVELS = { debug: 0, log: 1, info: 2, warn: 3, error: 4 } as const;
type LogLevel = keyof typeof LOG_LEVELS;

const defaultLevel: LogLevel = process.env.CI ? 'warn' : 'debug';
const minLevel = LOG_LEVELS[(process.env.LOG_LEVEL as LogLevel) || defaultLevel];

export const logger = {
  debug: (...args: unknown[]) => minLevel <= LOG_LEVELS.debug && console.debug(...args),
  log: (...args: unknown[]) => minLevel <= LOG_LEVELS.log && console.log(...args),
  info: (...args: unknown[]) => minLevel <= LOG_LEVELS.info && console.info(...args),
  warn: (...args: unknown[]) => minLevel <= LOG_LEVELS.warn && console.warn(...args),
  error: (...args: unknown[]) => console.error(...args),
};
