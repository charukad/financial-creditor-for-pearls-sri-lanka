// client/src/api/economic.api.js

import API from "./index";

/**
 * Get current exchange rates for the Sri Lankan Rupee (LKR)
 * @returns {Promise} Exchange rate data
 */
export const getCurrentExchangeRates = async () => {
  try {
    console.log("🌐 Fetching current exchange rates");
    const response = await API.get("/economic/exchange-rates");
    console.log("✅ Exchange rates fetched successfully");
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch exchange rates:", error);
    // Create a user-friendly error message
    let errorMessage = "Failed to fetch exchange rates";
    if (error.data?.error) {
      errorMessage = error.data.error;
    } else if (!error.status) {
      errorMessage = "Network error. Please check your connection.";
    }
    throw { ...error, userMessage: errorMessage };
  }
};

/**
 * Get live economic data including exchange rates, inflation, and market indices
 * @returns {Promise} Comprehensive live economic data
 */
export const getLiveEconomicData = async () => {
  try {
    console.log("📊 Fetching live economic data");
    const response = await API.get("/economic/live");
    console.log("✅ Live economic data fetched successfully");
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch live economic data:", error);
    // Create a user-friendly error message
    let errorMessage = "Failed to fetch live economic data";
    if (error.data?.error) {
      errorMessage = error.data.error;
    } else if (!error.status) {
      errorMessage = "Network error. Please check your connection.";
    }
    throw { ...error, userMessage: errorMessage };
  }
};

/**
 * Get historical economic data for trend analysis
 * @param {Object} params - Query parameters including startDate and endDate
 * @returns {Promise} Historical economic data
 */
export const getHistoricalEconomicData = async (params) => {
  try {
    console.log("📈 Fetching historical economic data");
    const response = await API.get("/economic/historical", { params });
    console.log("✅ Historical economic data fetched successfully");
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch historical economic data:", error);
    // Create a user-friendly error message
    let errorMessage = "Failed to fetch historical economic data";
    if (error.data?.error) {
      errorMessage = error.data.error;
    } else if (!error.status) {
      errorMessage = "Network error. Please check your connection.";
    }
    throw { ...error, userMessage: errorMessage };
  }
};

/**
 * Get current economic indicators relevant to the garment industry
 * @returns {Promise} Economic indicator data
 */
export const getEconomicIndicators = async () => {
  try {
    console.log("📊 Fetching economic indicators");
    const response = await API.get("/economic/indicators");
    console.log("✅ Economic indicators fetched successfully");
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch economic indicators:", error);
    // Create a user-friendly error message
    let errorMessage = "Failed to fetch economic indicators";
    if (error.data?.error) {
      errorMessage = error.data.error;
    } else if (!error.status) {
      errorMessage = "Network error. Please check your connection.";
    }
    throw { ...error, userMessage: errorMessage };
  }
};

/**
 * Get industry-specific market data for the garment sector
 * @returns {Promise} Industry market data
 */
export const getIndustryMarketData = async () => {
  try {
    console.log("🏭 Fetching garment industry market data");
    const response = await API.get("/economic/industry-data");
    console.log("✅ Industry data fetched successfully");
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch industry data:", error);
    // Create a user-friendly error message
    let errorMessage = "Failed to fetch industry data";
    if (error.data?.error) {
      errorMessage = error.data.error;
    } else if (!error.status) {
      errorMessage = "Network error. Please check your connection.";
    }
    throw { ...error, userMessage: errorMessage };
  }
};

/**
 * Get supply chain status and alerts
 * @returns {Promise} Supply chain data and alerts
 */
export const getSupplyChainStatus = async () => {
  try {
    console.log("🔗 Fetching supply chain status");
    const response = await API.get("/economic/supply-chain");
    console.log("✅ Supply chain data fetched successfully");
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch supply chain data:", error);
    // Create a user-friendly error message
    let errorMessage = "Failed to fetch supply chain data";
    if (error.data?.error) {
      errorMessage = error.data.error;
    } else if (!error.status) {
      errorMessage = "Network error. Please check your connection.";
    }
    throw { ...error, userMessage: errorMessage };
  }
};

/**
 * Get weather and seasonal patterns that may impact garment demand
 * @param {string} region - Geographic region for weather data
 * @returns {Promise} Weather pattern data
 */
export const getWeatherPatterns = async (region = "sri-lanka") => {
  try {
    console.log(`🌦️ Fetching weather patterns for ${region}`);
    const response = await API.get(`/economic/weather/${region}`);
    console.log("✅ Weather data fetched successfully");
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch weather data:", error);
    // Create a user-friendly error message
    let errorMessage = "Failed to fetch weather pattern data";
    if (error.data?.error) {
      errorMessage = error.data.error;
    } else if (!error.status) {
      errorMessage = "Network error. Please check your connection.";
    }
    throw { ...error, userMessage: errorMessage };
  }
};

/**
 * Get trade policy updates that may impact garment exports
 * @returns {Promise} Trade policy data
 */
export const getTradePolicyUpdates = async () => {
  try {
    console.log("📜 Fetching trade policy updates");
    const response = await API.get("/economic/trade-policy");
    console.log("✅ Trade policy updates fetched successfully");
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch trade policy updates:", error);
    // Create a user-friendly error message
    let errorMessage = "Failed to fetch trade policy updates";
    if (error.data?.error) {
      errorMessage = error.data.error;
    } else if (!error.status) {
      errorMessage = "Network error. Please check your connection.";
    }
    throw { ...error, userMessage: errorMessage };
  }
};
