require("dotenv").config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5009,
  MONGODB_URI:
    process.env.MONGODB_URI || "mongodb://localhost:27017/revenue-prediction",
  JWT_SECRET: process.env.JWT_SECRET || "your_default_jwt_secret",
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || "1d",
};
