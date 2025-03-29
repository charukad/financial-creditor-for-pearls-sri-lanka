const mongoose = require("mongoose");

const ForecastSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: [true, "Company is required"],
  },
  forecastDate: {
    type: Date,
    required: [true, "Forecast date is required"],
  },
  forecastPeriod: {
    start: {
      type: Date,
      required: [true, "Forecast start date is required"],
    },
    end: {
      type: Date,
      required: [true, "Forecast end date is required"],
    },
  },
  forecastType: {
    type: String,
    enum: ["short-term", "medium-term", "long-term"],
    required: [true, "Forecast type is required"],
  },
  modelType: {
    type: String,
    enum: ["ARIMA", "Prophet", "RandomForest", "Ensemble"],
    required: [true, "Model type is required"],
  },
  forecastData: [
    {
      date: {
        type: Date,
        required: true,
      },
      revenue: {
        predicted: {
          type: Number,
          required: true,
        },
        lowerBound: Number,
        upperBound: Number,
      },
    },
  ],
  accuracy: {
    mape: Number, // Mean Absolute Percentage Error
    rmse: Number, // Root Mean Square Error
    mae: Number, // Mean Absolute Error
  },
  factors: {
    economicIndicators: {
      included: {
        type: Boolean,
        default: false,
      },
      details: {
        type: Map,
        of: String,
      },
    },
    seasonality: {
      included: {
        type: Boolean,
        default: false,
      },
      details: {
        type: Map,
        of: String,
      },
    },
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User reference is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Forecast", ForecastSchema);
