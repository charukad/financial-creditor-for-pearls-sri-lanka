const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const logger = require("../utils/logger");

// API request logging
router.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

// Test API endpoint
router.get("/test", (req, res) => {
  logger.info("Test endpoint hit");
  res.status(200).json({
    message: "API is working correctly",
    timestamp: new Date().toISOString(),
  });
});

// Test MongoDB connection
router.get("/test/mongodb", async (req, res) => {
  try {
    logger.info("MongoDB test endpoint hit");

    // Check MongoDB connection state
    const state = mongoose.connection.readyState;
    let stateMessage;

    switch (state) {
      case 0:
        stateMessage = "Disconnected";
        break;
      case 1:
        stateMessage = "Connected";
        break;
      case 2:
        stateMessage = "Connecting";
        break;
      case 3:
        stateMessage = "Disconnecting";
        break;
      default:
        stateMessage = "Unknown";
    }

    if (state === 1) {
      // Try to run a simple query
      const collections = await mongoose.connection.db
        .listCollections()
        .toArray();

      logger.info("MongoDB connection test successful");
      res.status(200).json({
        success: true,
        message: "MongoDB connection test successful",
        state: stateMessage,
        collections: collections.map((c) => c.name),
        timestamp: new Date().toISOString(),
      });
    } else {
      logger.warn(`MongoDB is not connected. Current state: ${stateMessage}`);
      res.status(500).json({
        success: false,
        message: "MongoDB is not connected",
        state: stateMessage,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    logger.error(`MongoDB test error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "MongoDB connection test failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Clear test data (for development only)
// Clear test data (for development only)
if (process.env.NODE_ENV === "development") {
  router.post("/test/clear-data", async (req, res) => {
    try {
      logger.info("Clear test data endpoint hit");

      // Check for a security token to prevent accidental data deletion
      const { securityToken } = req.body;
      if (securityToken !== "DEV_CLEAR_DATA_TOKEN") {
        logger.warn("Clear data attempt with invalid security token");
        return res.status(403).json({
          success: false,
          message: "Invalid security token",
        });
      }

      // Verify we're in development mode
      if (process.env.NODE_ENV !== "development") {
        logger.warn("Clear data attempt in non-development environment");
        return res.status(403).json({
          success: false,
          message: "This operation is only allowed in development environment",
        });
      }

      // Clear test data from all collections
      const collections = Object.keys(mongoose.connection.collections);
      const results = [];

      for (const collectionName of collections) {
        const count = await mongoose.connection.collections[
          collectionName
        ].countDocuments({});

        if (count > 0) {
          await mongoose.connection.collections[collectionName].deleteMany({});
          results.push({
            collection: collectionName,
            deleted: count,
            status: "cleared",
          });
        } else {
          results.push({
            collection: collectionName,
            deleted: 0,
            status: "empty",
          });
        }
      }

      logger.info("Test data cleared successfully");
      res.status(200).json({
        success: true,
        message: "All test data cleared successfully",
        results,
      });
    } catch (error) {
      logger.error(`Error clearing test data: ${error.message}`);
      res.status(500).json({
        success: false,
        message: "Failed to clear test data",
        error: error.message,
      });
    }
  });
}

// Import route modules
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const dataRoutes = require("./data.routes");
const forecastRoutes = require("./forecast.routes");
const reportRoutes = require("./report.routes");
const economicRoutes = require("./economic.routes");

// Register routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/data", dataRoutes);
router.use("/forecasts", forecastRoutes);
router.use("/reports", reportRoutes);
router.use("/economic", economicRoutes);

// Add error handling for routes
router.use((req, res, next) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
  });
});

module.exports = router;
