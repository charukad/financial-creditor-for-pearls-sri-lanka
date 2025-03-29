const Forecast = require("../models/forecast.model");
const Data = require("../models/data.model");

// Helper function to generate mock forecast data
// In a real implementation, this would use actual ML models like ARIMA, Prophet, etc.
const generateForecastData = (historicalData, months = 6) => {
  // Get the latest date from historical data
  const latestData = historicalData.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )[0];
  const latestDate = new Date(latestData.date);

  // Calculate average growth rate from historical data
  let totalGrowthRate = 0;
  for (let i = 1; i < historicalData.length; i++) {
    const currentRevenue = historicalData[i].revenue;
    const previousRevenue = historicalData[i - 1].revenue;
    if (previousRevenue > 0) {
      totalGrowthRate += (currentRevenue - previousRevenue) / previousRevenue;
    }
  }
  const avgGrowthRate = totalGrowthRate / (historicalData.length - 1) || 0.02; // Default to 2% if can't calculate

  // Generate forecast for the next X months
  const forecastData = [];
  let lastRevenue = latestData.revenue;

  for (let i = 1; i <= months; i++) {
    const forecastDate = new Date(latestDate);
    forecastDate.setMonth(forecastDate.getMonth() + i);

    // Add some randomness to the growth rate for realism
    const randomVariation = Math.random() * 0.04 - 0.02; // -2% to +2%
    const growthRate = avgGrowthRate + randomVariation;

    // Calculate predicted revenue
    const predictedRevenue = lastRevenue * (1 + growthRate);

    // Calculate upper and lower bounds (±10%)
    const upperBound = predictedRevenue * 1.1;
    const lowerBound = predictedRevenue * 0.9;

    forecastData.push({
      date: forecastDate,
      revenue: {
        predicted: predictedRevenue,
        upperBound,
        lowerBound,
      },
    });

    lastRevenue = predictedRevenue;
  }

  return forecastData;
};

// @desc    Generate new forecast
// @route   POST /api/forecasts
// @access  Private
exports.generateForecast = async (req, res, next) => {
  try {
    const { forecastType, months, includeEconomicIndicators } = req.body;

    // Validate input
    if (!forecastType || !months) {
      return res.status(400).json({
        success: false,
        error: "Please provide forecast type and number of months",
      });
    }

    // Get historical data for the company
    const historicalData = await Data.find({ company: req.user.company })
      .sort({ date: 1 }) // Sort by date ascending
      .limit(24); // Use last 24 data points

    if (historicalData.length < 3) {
      return res.status(400).json({
        success: false,
        error:
          "Not enough historical data to generate forecast. Please add more data points.",
      });
    }

    // Generate forecast data (placeholder for ML model)
    const forecastData = generateForecastData(historicalData, months);

    // Determine date range for the forecast
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + parseInt(months));

    // Create the forecast record
    const forecast = await Forecast.create({
      company: req.user.company,
      forecastDate: new Date(),
      forecastPeriod: {
        start: startDate,
        end: endDate,
      },
      forecastType,
      modelType: "Ensemble", // Placeholder for now
      forecastData,
      accuracy: {
        mape: Math.random() * 10 + 5, // Random MAPE between 5-15%
        rmse: Math.random() * 1000000 + 500000, // Random RMSE
        mae: Math.random() * 500000 + 250000, // Random MAE
      },
      factors: {
        economicIndicators: {
          included: includeEconomicIndicators || false,
        },
        seasonality: {
          included: true,
        },
      },
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: forecast,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all forecasts for a company
// @route   GET /api/forecasts
// @access  Private
exports.getForecasts = async (req, res, next) => {
  try {
    // Find all forecasts for the user's company
    const forecasts = await Forecast.find({ company: req.user.company })
      .sort({ forecastDate: -1 }) // Sort by most recent first
      .populate("createdBy", "fullName");

    res.status(200).json({
      success: true,
      count: forecasts.length,
      data: forecasts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get forecast by ID
// @route   GET /api/forecasts/:id
// @access  Private
exports.getForecastById = async (req, res, next) => {
  try {
    // Find forecast by ID
    const forecast = await Forecast.findById(req.params.id).populate(
      "createdBy",
      "fullName"
    );

    // Check if forecast exists
    if (!forecast) {
      return res.status(404).json({
        success: false,
        error: "Forecast not found",
      });
    }

    // Check if user belongs to the company that owns the forecast
    if (forecast.company.toString() !== req.user.company.toString()) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to access this forecast",
      });
    }

    res.status(200).json({
      success: true,
      data: forecast,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete forecast
// @route   DELETE /api/forecasts/:id
// @access  Private
exports.deleteForecast = async (req, res, next) => {
  try {
    // Find forecast by ID
    const forecast = await Forecast.findById(req.params.id);

    // Check if forecast exists
    if (!forecast) {
      return res.status(404).json({
        success: false,
        error: "Forecast not found",
      });
    }

    // Check if user belongs to the company that owns the forecast
    if (forecast.company.toString() !== req.user.company.toString()) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this forecast",
      });
    }

    // Delete forecast
    await forecast.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
