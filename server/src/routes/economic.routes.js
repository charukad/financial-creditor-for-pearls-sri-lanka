// server/src/routes/economic.routes.js

const express = require("express");
const economicController = require("../controllers/economic.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Get live economic data
router.get(
  "/live",
  authMiddleware.authenticateUser,
  economicController.getLiveEconomicData
);

// Get historical economic data
router.get(
  "/historical",
  authMiddleware.authenticateUser,
  economicController.getHistoricalEconomicData
);

// Get exchange rates
router.get(
  "/exchange-rates",
  authMiddleware.authenticateUser,
  economicController.getExchangeRates
);

// Get economic indicators
router.get(
  "/indicators",
  authMiddleware.authenticateUser,
  economicController.getEconomicIndicators
);

// Get industry market data
router.get(
  "/industry-data",
  authMiddleware.authenticateUser,
  economicController.getIndustryData
);

// Get supply chain status
router.get(
  "/supply-chain",
  authMiddleware.authenticateUser,
  economicController.getSupplyChainStatus
);

// Get trade policy updates
router.get(
  "/trade-policy",
  authMiddleware.authenticateUser,
  economicController.getTradePolicyUpdates
);

// Get weather patterns
router.get(
  "/weather/:region?",
  authMiddleware.authenticateUser,
  economicController.getWeatherPatterns
);

module.exports = router;
