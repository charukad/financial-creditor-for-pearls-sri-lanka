const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { NODE_ENV } = require("./environment");
const errorMiddleware = require("../middleware/error.middleware");

module.exports = (app) => {
  // Parse JSON bodies
  app.use(express.json());

  // Parse URL-encoded bodies
  app.use(express.urlencoded({ extended: true }));

  // Enable CORS
  app.use(cors());

  // HTTP request logger
  if (NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

  // Error handling middleware
  app.use(errorMiddleware);

  return app;
};
