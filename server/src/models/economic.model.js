const mongoose = require("mongoose");

/**
 * Schema for economic data relevant to the Sri Lankan garment industry
 * Includes both historical records and latest indicators
 */
const economicDataSchema = new mongoose.Schema(
  {
    // Type of indicator (e.g., "exchange_rate", "inflation_rate", "gdp_growth", etc.)
    indicatorType: {
      type: String,
      required: true,
      trim: true,
    },
    // The value of the economic indicator
    value: {
      type: Number,
      required: true,
    },
    // Country or region this indicator applies to (default: "Sri Lanka")
    country: {
      type: String,
      required: true,
      default: "Sri Lanka",
      trim: true,
    },
    // Date when this economic data was recorded
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    // Source of the economic data (e.g., "Central Bank", "Department of Census", etc.)
    source: {
      type: String,
      trim: true,
    },
    // Whether this is the latest data point for this indicator type
    isLatest: {
      type: Boolean,
      default: false,
    },
    // Additional metadata or notes about this economic indicator
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster querying by indicator type and date
economicDataSchema.index({ indicatorType: 1, date: -1 });
// Index for quickly finding the latest indicators
economicDataSchema.index({ isLatest: 1, indicatorType: 1 });

// Create and export the model
const EconomicData = mongoose.model("EconomicData", economicDataSchema);

module.exports = EconomicData;
