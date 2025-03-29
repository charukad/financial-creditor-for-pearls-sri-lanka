const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { register, login, getMe } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

// Regular auth routes
// CRITICAL: Using the actual controller function instead of a placeholder
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

// Test MongoDB connection route
router.get("/db-status", (req, res) => {
  try {
    const state = mongoose.connection.readyState;
    const stateMap = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    res.status(200).json({
      success: true,
      dbState: stateMap[state] || "unknown",
      readyState: state,
      dbName: mongoose.connection.name,
      host: mongoose.connection.host,
      models: Object.keys(mongoose.models),
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error checking DB status:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Test direct MongoDB save
router.post("/test-mongo", async (req, res) => {
  try {
    console.log("Testing direct MongoDB save");

    // Create a simple test schema
    const TestSchema = new mongoose.Schema({
      name: String,
      email: String,
      timestamp: { type: Date, default: Date.now },
    });

    // Create or retrieve the model
    const Test = mongoose.models.Test || mongoose.model("Test", TestSchema);

    // Create a test document
    const testDoc = new Test({
      name: "Test User",
      email: "test@example.com",
    });

    // Save the document
    await testDoc.save();
    console.log("Test document saved successfully with ID:", testDoc._id);

    // Retrieve the document to confirm it was saved
    const savedDoc = await Test.findById(testDoc._id);

    res.status(200).json({
      success: true,
      message: "Test document saved to MongoDB",
      document: savedDoc,
      mongoStatus: {
        readyState: mongoose.connection.readyState,
        db: mongoose.connection.name,
      },
    });
  } catch (error) {
    console.error("Error saving test document:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save test document",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Direct registration implementation - alternative endpoint for testing
router.post("/direct-register", async (req, res) => {
  try {
    console.log("Direct registration implementation");
    console.log("Request body:", { ...req.body, password: "[REDACTED]" });

    const { companyName, fullName, email, password, industry } = req.body;

    // Validate required fields
    if (!companyName || !fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        requiredFields: ["companyName", "fullName", "email", "password"],
      });
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({
        success: false,
        message: "MongoDB not connected",
        readyState: mongoose.connection.readyState,
      });
    }

    // Get your models
    const User = mongoose.model("User");
    const Company = mongoose.model("Company");

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create company
    const company = new Company({
      name: companyName,
      industry: industry || "apparel manufacturing",
    });
    await company.save();
    console.log("Company saved directly with ID:", company._id);

    // Create user
    const user = new User({
      fullName,
      email,
      password, // Will be hashed by the pre-save hook
      company: company._id,
    });
    await user.save();
    console.log("User saved directly with ID:", user._id);

    res.status(201).json({
      success: true,
      message: "User registered directly",
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
      },
      company: {
        id: company._id,
        name: company.name,
      },
    });
  } catch (error) {
    console.error("Direct registration error:", error);

    // Check for duplicate key error (MongoDB error code 11000)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate entry. Email or company name may already exist.",
        error: error.message,
      });
    }

    // Check for validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

module.exports = router;
