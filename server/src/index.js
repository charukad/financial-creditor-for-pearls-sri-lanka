const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const logger = require("./utils/logger");
const routes = require("./routes");

// Load environment variables
dotenv.config();

// Get MongoDB URI from environment variables
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/revenue-prediction";
const PORT = process.env.PORT || 5009;

// Configure global unhandled exception and promise rejection handling
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

// Log initial MongoDB connection state
console.log(
  "Initial MongoDB connection state:",
  mongoose.connection.readyState
);
console.log(
  "MongoDB URI (redacted):",
  MONGODB_URI.replace(/:\/\/([^:]+):([^@]+)@/, "://****:****@")
);

// Handle MongoDB connection events
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
  logger.error(`MongoDB connection error: ${err.message}`);
});

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected successfully");
  logger.info("MongoDB connected successfully");
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
  logger.warn("MongoDB disconnected");
});

// Connect to MongoDB with detailed error handling
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("MongoDB connected successfully");
    logger.info("MongoDB connected successfully");

    // Check database details to confirm connection
    const db = mongoose.connection;
    console.log("Connected to database:", db.name);
    console.log("Connected to host:", db.host);
    console.log("Connected to port:", db.port);

    try {
      // List all collections to verify database access
      const collections = await db.db.listCollections().toArray();
      console.log(
        "Available collections:",
        collections.map((c) => c.name)
      );

      // Start the server after successful database connection
      startServer();
    } catch (error) {
      console.error("Error accessing database collections:", error);
      logger.error(`Error accessing database collections: ${error.message}`);
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    console.error("Error details:", {
      name: err.name,
      message: err.message,
      code: err.code,
      stack: err.stack,
    });
    logger.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  });

function startServer() {
  const app = express();

  // CORS configuration - MUST BE BEFORE OTHER MIDDLEWARE
  app.use(
    cors({
      origin: "http://localhost:3000", // Your React app's address
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
      optionsSuccessStatus: 204,
    })
  );

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });

  // Body parsers - IMPORTANT FOR RECEIVING JSON DATA
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Routes
  app.use("/api", routes);

  // Health check endpoint
  app.get("/health", (req, res) => {
    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    res.status(200).json({
      status: "ok",
      server: "running",
      database: dbStatus,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle 404 errors
  app.use((req, res) => {
    logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
      success: false,
      message: "Route not found",
      path: req.originalUrl,
    });
  });

  // Global error handling middleware
  app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    // Log detailed error information
    console.error(`Error in ${req.method} ${req.path}:`, err);
    logger.error(`Error in ${req.method} ${req.path}: ${err.message}`);

    // Send appropriate error response
    res.status(statusCode).json({
      success: false,
      error: err.message || "Internal Server Error",
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  });

  // Start the server
  const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    console.log(`Server running on port ${PORT}`);
  });

  // Handle server shutdown gracefully
  const shutDown = () => {
    console.log("Received kill signal, shutting down gracefully");
    server.close(() => {
      console.log("Closed out remaining connections");
      mongoose.connection.close(false, () => {
        console.log("MongoDB connection closed");
        process.exit(0);
      });
    });

    setTimeout(() => {
      console.error(
        "Could not close connections in time, forcefully shutting down"
      );
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", shutDown);
  process.on("SIGINT", shutDown);
}
