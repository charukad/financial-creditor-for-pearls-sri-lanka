const User = require("../models/user.model");
const Company = require("../models/company.model");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRATION } = require("../config/environment");
const mongoose = require("mongoose");
const logger = require("../utils/logger");

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION || "30d",
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    console.log("=== REGISTRATION PROCESS STARTED ===");
    console.log("Request body:", { ...req.body, password: "[REDACTED]" });
    logger.info(`Registration request received for email: ${req.body.email}`);

    const { companyName, fullName, email, password, industry } = req.body;

    // Validate required fields
    if (!companyName || !fullName || !email || !password) {
      logger.warn("Registration failed: Missing required fields");
      return res.status(400).json({
        success: false,
        error:
          "Please provide all required fields: company name, full name, email, and password",
      });
    }

    // Check database connection before proceeding
    if (mongoose.connection.readyState !== 1) {
      console.error(
        "MongoDB not connected. Current state:",
        mongoose.connection.readyState
      );
      logger.error(
        `Registration failed: MongoDB not connected. State: ${mongoose.connection.readyState}`
      );
      return res.status(500).json({
        success: false,
        error: "Database connection issue. Please try again later.",
      });
    }

    console.log("Checking for existing user with email:", email);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists with email:", email);
      logger.warn(
        `Registration failed: User already exists with email: ${email}`
      );
      return res.status(400).json({
        success: false,
        error: "User with this email already exists",
      });
    }

    console.log("Creating new company:", companyName);
    logger.info(`Creating new company: ${companyName}`);

    // Use a try-catch block for each critical database operation
    let company;
    try {
      // Create company first
      company = await Company.create({
        name: companyName,
        industry: industry || "apparel manufacturing",
      });
      console.log("Company created successfully with ID:", company._id);
      logger.info(`Company created successfully with ID: ${company._id}`);
    } catch (companyError) {
      console.error("Error creating company:", companyError);
      logger.error(`Error creating company: ${companyError.message}`);

      // Check for duplicate company name (MongoDB error code 11000)
      if (companyError.code === 11000) {
        return res.status(400).json({
          success: false,
          error: "A company with this name already exists",
        });
      }

      return res.status(500).json({
        success: false,
        error: "Failed to create company. Please try again later.",
      });
    }

    console.log("Creating new user for email:", email);
    logger.info(`Creating new user for email: ${email}`);

    // Create user with reference to company
    let user;
    try {
      user = await User.create({
        fullName,
        email,
        password,
        company: company._id,
      });
      console.log("User created successfully with ID:", user._id);
      logger.info(`User created successfully with ID: ${user._id}`);
    } catch (userError) {
      console.error("Error creating user:", userError);
      logger.error(`Error creating user: ${userError.message}`);

      // Clean up: remove the company if user creation fails
      if (company) {
        console.log("Removing company due to user creation failure");
        logger.info(
          `Removing company ${company._id} due to user creation failure`
        );
        try {
          await Company.findByIdAndDelete(company._id);
        } catch (cleanupError) {
          console.error("Error during cleanup:", cleanupError);
          logger.error(`Error during cleanup: ${cleanupError.message}`);
        }
      }

      // Check for validation errors
      if (userError.name === "ValidationError") {
        const messages = Object.values(userError.errors).map(
          (err) => err.message
        );
        return res.status(400).json({
          success: false,
          error: `Validation Error: ${messages.join(", ")}`,
        });
      }

      return res.status(500).json({
        success: false,
        error: "Failed to create user. Please try again later.",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    console.log("Registration completed successfully for user:", user._id);
    logger.info(`Registration completed successfully for user: ${user._id}`);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        companyId: company._id,
        companyName: company.name,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    logger.error(`Registration error: ${error.message}`);

    // If not already handled, pass to global error handler
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    console.log("Login attempt for email:", req.body.email);
    logger.info(`Login attempt for email: ${req.body.email}`);

    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      logger.warn("Login failed: Missing email or password");
      return res.status(400).json({
        success: false,
        error: "Please provide email and password",
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      logger.warn(`Login failed: No user found with email ${email}`);
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      logger.warn(`Login failed: Invalid password for email ${email}`);
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Get company information
    const company = await Company.findById(user.company);
    if (!company) {
      logger.error(`Associated company not found for user ${user._id}`);
      return res.status(500).json({
        success: false,
        error: "User account issue. Please contact support.",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    logger.info(`Login successful for user: ${user._id}`);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        companyId: company._id,
        companyName: company.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    logger.error(`Login error: ${error.message}`);
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    console.log("Get current user request for ID:", req.user.id);
    logger.info(`Get current user request for ID: ${req.user.id}`);

    const user = await User.findById(req.user.id);

    if (!user) {
      logger.warn(`User not found with ID: ${req.user.id}`);
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const company = await Company.findById(user.company);
    if (!company) {
      logger.error(`Associated company not found for user ${user._id}`);
      return res.status(500).json({
        success: false,
        error: "User account issue. Please contact support.",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        companyId: company._id,
        companyName: company.name,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    logger.error(`Get current user error: ${error.message}`);
    next(error);
  }
};
