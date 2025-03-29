// A simple client-side logger

// Log levels
const LOG_LEVELS = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  DEBUG: "debug",
};

// Current log level
const currentLevel =
  process.env.NODE_ENV === "development" ? LOG_LEVELS.DEBUG : LOG_LEVELS.ERROR;

// Determine if a message should be logged based on its level
const shouldLog = (level) => {
  const levels = Object.values(LOG_LEVELS);
  const currentIndex = levels.indexOf(currentLevel);
  const messageIndex = levels.indexOf(level);

  return messageIndex <= currentIndex;
};

// Logger methods
const logger = {
  error: (message, ...args) => {
    if (shouldLog(LOG_LEVELS.ERROR)) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  },

  warn: (message, ...args) => {
    if (shouldLog(LOG_LEVELS.WARN)) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },

  info: (message, ...args) => {
    if (shouldLog(LOG_LEVELS.INFO)) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },

  debug: (message, ...args) => {
    if (shouldLog(LOG_LEVELS.DEBUG)) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },

  // Log a group of related messages
  group: (label, fn) => {
    console.group(label);
    fn();
    console.groupEnd();
  },
};

export default logger;
