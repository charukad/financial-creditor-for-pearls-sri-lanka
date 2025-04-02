// server/src/models/data.model.js

const mongoose = require("mongoose");

// Define the data schema for revenue data
const dataSchema = new mongoose.Schema(
  {
    // Company that this data belongs to (reference to Company model)
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company ID is required"],
    },

    // Date of the revenue entry
    date: {
      type: Date,
      required: [true, "Date is required"],
    },

    // Revenue amount
    revenue: {
      type: Number,
      required: [true, "Revenue amount is required"],
      min: [0, "Revenue cannot be negative"],
    },

    // Optional expenses amount
    expenses: {
      type: Number,
      min: [0, "Expenses cannot be negative"],
      default: 0,
    },

    // Product category (e.g., shirts, pants, dresses)
    productCategory: {
      type: String,
      trim: true,
    },

    // Export region (e.g., North America, Europe, Asia)
    region: {
      type: String,
      trim: true,
    },

    // User who uploaded this data
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },

    // Any additional notes for this entry
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    // Enable timestamps which will add createdAt and updatedAt fields
    timestamps: true,
  }
);

// Create the model from the schema
const Data = mongoose.model("Data", dataSchema);

// Export the model
module.exports = Data;
