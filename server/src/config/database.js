const mongoose = require("mongoose");
const { MONGODB_URI } = require("./environment");
const logger = require("../utils/logger");

// Set mongoose options
mongoose.set("strictQuery", false);

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
