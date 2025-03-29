const winston = require("winston");
const path = require("path");
const fs = require("fs");

// Create logs directory if it doesn't exist
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Define log format
const logFormat = winston.format.printf(
  ({ level, message, timestamp, ...metadata }) => {
    let metaStr = "";
    if (Object.keys(metadata).length > 0) {
      metaStr = JSON.stringify(metadata);
    }
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaStr}`;
  }
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.metadata({ fillExcept: ["message", "level", "timestamp"] }),
    logFormat
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat),
    }),
    // Error log file
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined log file
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, "exceptions.log"),
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.json()
      ),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add rejection handling
logger.rejections.handle(
  new winston.transports.File({
    filename: path.join(logDir, "rejections.log"),
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.json()
    ),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  })
);

// Add request logging method
logger.logRequest = (req, res, next) => {
  const start = new Date();

  res.on("finish", () => {
    const duration = new Date() - start;
    logger.info(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
    );
  });

  next();
};

module.exports = logger;
