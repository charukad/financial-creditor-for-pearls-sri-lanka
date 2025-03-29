const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const logger = require("../utils/logger");

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please provide a valid email address",
    ],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
    select: false,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: [true, "Company is required"],
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
  try {
    console.log("User pre-save hook running for:", this.email);
    logger.info(`User pre-save hook running for: ${this.email}`);

    if (!this.isModified("password")) {
      console.log("Password not modified, skipping hashing");
      logger.info("Password not modified, skipping hashing");
      return next();
    }

    console.log("Hashing password");
    logger.info("Hashing password");

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    console.log("Password hashed successfully");
    logger.info("Password hashed successfully");
    next();
  } catch (error) {
    console.error("Error in User pre-save hook:", error);
    logger.error(`Error in User pre-save hook: ${error.message}`);
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    logger.info("Comparing passwords");
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    logger.info(`Password match result: ${isMatch}`);
    return isMatch;
  } catch (error) {
    console.error("Error comparing passwords:", error);
    logger.error(`Error comparing passwords: ${error.message}`);
    throw error;
  }
};

// Static method for error-handled creation
UserSchema.statics.createWithErrorHandling = async function (userData) {
  try {
    logger.info(`Creating user with data for email: ${userData.email}`);

    // Basic validation
    if (
      !userData.email ||
      !userData.password ||
      !userData.fullName ||
      !userData.company
    ) {
      throw new Error("Missing required user fields");
    }

    const user = new this(userData);
    await user.save();

    logger.info(`User saved successfully with ID: ${user._id}`);
    return user;
  } catch (error) {
    logger.error(`Error creating user: ${error.message}`);

    // Handle duplicate key errors
    if (error.code === 11000) {
      throw new Error("A user with this email already exists");
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      throw new Error(`Validation Error: ${messages.join(", ")}`);
    }

    throw error;
  }
};

module.exports = mongoose.model("User", UserSchema);
