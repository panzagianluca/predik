/**
 * Production-safe logger
 * Logs only in development, silent in production
 */

const isDevelopment = process.env.NODE_ENV === "development";

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      logger.log(...args);
    }
  },

  warn: (...args: any[]) => {
    if (isDevelopment) {
      logger.warn(...args);
    }
  },

  error: (...args: any[]) => {
    // Always log errors, even in production (for error tracking services)
    logger.error(...args);
  },

  info: (...args: any[]) => {
    if (isDevelopment) {
      logger.info(...args);
    }
  },

  debug: (...args: any[]) => {
    if (isDevelopment) {
      logger.debug(...args);
    }
  },
};
