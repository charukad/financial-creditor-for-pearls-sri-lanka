const express = require("express");
const router = express.Router();
const {
  generateForecast,
  getForecasts,
  getForecastById,
  deleteForecast,
} = require("../controllers/forecast.controller");
const { protect } = require("../middleware/auth.middleware");

// Protect all routes
router.use(protect);

// @route   POST /api/forecasts
// @desc    Generate new forecast
// @access  Private
router.post("/", generateForecast);

// @route   GET /api/forecasts
// @desc    Get all forecasts for a company
// @access  Private
router.get("/", getForecasts);

// @route   GET /api/forecasts/:id
// @desc    Get forecast by ID
// @access  Private
router.get("/:id", getForecastById);

// @route   DELETE /api/forecasts/:id
// @desc    Delete forecast
// @access  Private
router.delete("/:id", deleteForecast);

module.exports = router;
