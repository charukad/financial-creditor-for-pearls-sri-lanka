// In your server/src/app.js
const express = require("express");
const cors = require("cors");
const app = express();

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:3000", // Your React app's URL
    credentials: true,
  })
);

// Parse JSON request body
app.use(express.json());

// Routes
app.use("/api", require("./routes"));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || "Server error",
  });
});

module.exports = app;
