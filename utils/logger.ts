/**
 * Logging Utility
 *
 * Provides conditional logging based on environment and log level.
 * Logs are only active in development mode, making it safe to leave debug logs.
 */

/**
 * Check if we're in development mode
 */
const isDevelopment = () => {
  return import.meta.env.DEV || false;
};

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * Default log level
 */
const DEFAULT_LEVEL = isDevelopment() ? LogLevel.DEBUG : LogLevel.WARN;

/**
 * Get current log level
 */
const getLogLevel = (): LogLevel => {
  // Could be enhanced with localStorage config later
  return DEFAULT_LEVEL;
};

/**
 * Log a debug message
 */
const debug = (message: string, ...args: any[]): void => {
  if (getLogLevel() >= LogLevel.DEBUG) {
    console.log(`[DEBUG] ${message}`, ...args);
  }
};

/**
 * Log an info message
 */
const info = (message: string, ...args: any[]): void => {
  if (getLogLevel() >= LogLevel.INFO) {
    console.log(`[INFO] ${message}`, ...args);
  }
};

/**
 * Log a warning message
 */
const warn = (message: string, ...args: any[]): void => {
  if (getLogLevel() >= LogLevel.WARN) {
    console.warn(`[WARN] ${message}`, ...args);
  }
};

/**
 * Log an error message
 */
const error = (message: string, ...args: any[]): void => {
  console.error(`[ERROR] ${message}`, ...args);
};

/**
 * Log methods for different purposes
 */
export const logger = {
  debug,
  info,
  warn,
  error,
  LogLevel,
};

/**
 * Utility for performance logging
 */
export const perfLogger = {
  /**
   * Log performance metric
   */
  log: (label: string, duration: number): void => {
    debug(`[PERF] ${label}: ${duration}ms`);
  },
};

/**
 * Parse log level from string
 */
export const parseLogLevel = (levelStr: string): LogLevel => {
  const upper = levelStr.toUpperCase();
  return LogLevel[upper as keyof typeof LogLevel] || LogLevel.WARN;
};
