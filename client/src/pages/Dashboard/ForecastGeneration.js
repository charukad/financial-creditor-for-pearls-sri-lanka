import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRevenueData } from "../../api/data.api";
import {
  generateForecast,
  getForecasts,
  deleteForecast,
} from "../../api/forecast.api";
import {
  getCurrentExchangeRates,
  getEconomicIndicators,
} from "../../api/economic.api";
import {
  formatCurrency,
  formatDate,
  formatPercent,
} from "../../utils/formatters";
import "./ForecastGeneration.css";

const ForecastGeneration = () => {
  const navigate = useNavigate();
  const [dataCount, setDataCount] = useState(0);
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [economicData, setEconomicData] = useState(null);
  const [isLoadingEconomicData, setIsLoadingEconomicData] = useState(false);
  const [formData, setFormData] = useState({
    forecastType: "medium-term",
    modelType: "ensemble",
    months: 6,
    includeEconomicIndicators: true,
    includeSeasonality: true,
    customEconomicParams: false,
  });
  const [customEconomicParams, setCustomEconomicParams] = useState({
    exchangeRate: "",
    inflation: "",
    gdpGrowth: "",
    exportGrowth: "",
  });

  useEffect(() => {
    // Load existing forecasts and check data availability
    fetchForecasts();
    checkDataAvailability();

    // Fetch real-time economic data
    fetchEconomicData();

    // Set up auto-refresh for economic data every 30 minutes
    const refreshInterval = setInterval(fetchEconomicData, 30 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);

  // Check if there's enough data for forecasting
  const checkDataAvailability = async () => {
    try {
      const response = await getRevenueData();
      if (response.success) {
        setDataCount(response.data?.length || 0);
      }
    } catch (err) {
      console.error("Error checking data availability:", err);
    }
  };

  // Fetch existing forecasts
  const fetchForecasts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getForecasts();

      if (response.success) {
        setForecasts(response.data || []);
      } else {
        setError(response.error || "Failed to fetch forecasts");
      }
    } catch (err) {
      setError("Error loading forecasts. Please try again.");
      console.error("Forecast fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch real-time economic data
  const fetchEconomicData = async () => {
    try {
      setIsLoadingEconomicData(true);

      // Fetch exchange rates and economic indicators in parallel
      const [ratesResponse, indicatorsResponse] = await Promise.all([
        getCurrentExchangeRates(),
        getEconomicIndicators(),
      ]);

      if (ratesResponse.success && indicatorsResponse.success) {
        setEconomicData({
          exchangeRates: ratesResponse.data,
          indicators: indicatorsResponse.data,
          lastUpdated: new Date().toISOString(),
        });

        // Update custom params with real values as placeholders
        setCustomEconomicParams({
          exchangeRate: ratesResponse.data.USD_LKR.toFixed(2),
          inflation: indicatorsResponse.data.inflation.toFixed(1),
          gdpGrowth: indicatorsResponse.data.gdpGrowth.toFixed(1),
          exportGrowth: indicatorsResponse.data.exportGrowth.toFixed(1),
        });
      }
    } catch (err) {
      console.error("Error fetching economic data:", err);
    } finally {
      setIsLoadingEconomicData(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle custom economic parameter changes
  const handleCustomParamChange = (e) => {
    const { name, value } = e.target;
    setCustomEconomicParams({
      ...customEconomicParams,
      [name]: value,
    });
  };

  // Generate a new forecast
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (dataCount < 3) {
      setError(
        "Not enough data to generate a forecast. Please add at least 3 revenue data points."
      );
      return;
    }

    try {
      setGenerating(true);
      setError(null);
      setSuccess(null);

      // Prepare economic data based on whether custom params are enabled
      let economicDataForForecast = economicData;

      if (formData.customEconomicParams && formData.includeEconomicIndicators) {
        economicDataForForecast = {
          ...economicData,
          customParams: {
            exchangeRate: parseFloat(customEconomicParams.exchangeRate),
            inflation: parseFloat(customEconomicParams.inflation),
            gdpGrowth: parseFloat(customEconomicParams.gdpGrowth),
            exportGrowth: parseFloat(customEconomicParams.exportGrowth),
          },
        };
      }

      // Prepare forecast data with economic indicators if enabled
      const forecastData = {
        ...formData,
        months: parseInt(formData.months, 10),
        economicData: formData.includeEconomicIndicators
          ? economicDataForForecast
          : null,
      };

      const response = await generateForecast(forecastData);

      if (response.success) {
        setSuccess("Forecast generated successfully");
        // Refresh forecasts list
        fetchForecasts();
        // Navigate to visualization page with the new forecast ID
        navigate(`/dashboard/visualizations?forecast=${response.data._id}`);
      } else {
        setError(response.error || "Failed to generate forecast");
      }
    } catch (err) {
      setError("Error generating forecast. Please try again.");
      console.error("Forecast generation error:", err);
    } finally {
      setGenerating(false);
    }
  };

  // Delete a forecast
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this forecast?")) {
      return;
    }

    try {
      setLoading(true);

      const response = await deleteForecast(id);

      if (response.success) {
        setSuccess("Forecast deleted successfully");
        // Refresh forecasts list
        fetchForecasts();
      } else {
        setError(response.error || "Failed to delete forecast");
      }
    } catch (err) {
      setError("Error deleting forecast. Please try again.");
      console.error("Forecast deletion error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to format forecast type for display
  const getTypeLabel = (type) => {
    switch (type) {
      case "short-term":
        return "Short-term (1-3 months)";
      case "medium-term":
        return "Medium-term (3-12 months)";
      case "long-term":
        return "Long-term (1-3 years)";
      default:
        return type;
    }
  };

  // Helper to format model type for display
  const getModelLabel = (type) => {
    switch (type) {
      case "arima":
        return "ARIMA (Time Series Analysis)";
      case "prophet":
        return "Prophet (Time Series Analysis)";
      case "randomForest":
        return "Random Forest (Machine Learning)";
      case "ensemble":
        return "Ensemble (Combined Models)";
      default:
        return type;
    }
  };

  // Render real-time economic data summary
  const renderEconomicDataSummary = () => {
    if (!economicData || !formData.includeEconomicIndicators) return null;

    const { exchangeRates, indicators } = economicData;
    const useCustomParams = formData.customEconomicParams;

    return (
      <div className="economic-data-summary">
        <h4>Current Economic Indicators</h4>
        <p>
          Your forecast will incorporate{" "}
          {useCustomParams ? "custom" : "real-time"} economic indicators:
        </p>

        <div className="economic-summary-grid">
          <div className="summary-item">
            <span className="item-label">USD/LKR:</span>
            <span className="item-value">
              {useCustomParams
                ? customEconomicParams.exchangeRate
                : exchangeRates?.USD_LKR.toFixed(2)}
            </span>
            {!useCustomParams &&
              renderTrendIndicator(
                exchangeRates?.USD_LKR,
                exchangeRates?.previousUSD_LKR
              )}
          </div>

          <div className="summary-item">
            <span className="item-label">Inflation:</span>
            <span className="item-value">
              {useCustomParams
                ? customEconomicParams.inflation
                : indicators?.inflation.toFixed(1)}
              %
            </span>
            {!useCustomParams &&
              renderTrendIndicator(
                indicators?.inflation,
                indicators?.previousInflation,
                true
              )}
          </div>

          <div className="summary-item">
            <span className="item-label">GDP Growth:</span>
            <span className="item-value">
              {useCustomParams
                ? customEconomicParams.gdpGrowth
                : indicators?.gdpGrowth.toFixed(1)}
              %
            </span>
            {!useCustomParams &&
              renderTrendIndicator(
                indicators?.gdpGrowth,
                indicators?.previousGDPGrowth
              )}
          </div>

          <div className="summary-item">
            <span className="item-label">Export Growth:</span>
            <span className="item-value">
              {useCustomParams
                ? customEconomicParams.exportGrowth
                : indicators?.exportGrowth.toFixed(1)}
              %
            </span>
            {!useCustomParams &&
              renderTrendIndicator(
                indicators?.exportGrowth,
                indicators?.previousExportGrowth
              )}
          </div>
        </div>

        <p className="data-timestamp">
          {useCustomParams
            ? "Using custom parameters for forecast"
            : `Data as of: ${formatDate(economicData.lastUpdated)}`}
          {isLoadingEconomicData && (
            <span className="refreshing-indicator"> (Refreshing...)</span>
          )}
        </p>

        <button
          type="button"
          className="btn btn-sm btn-outline-primary refresh-economic-btn"
          onClick={fetchEconomicData}
          disabled={isLoadingEconomicData}
        >
          {isLoadingEconomicData ? "Refreshing..." : "Refresh Economic Data"}
        </button>
      </div>
    );
  };

  // Helper to render trend indicators
  const renderTrendIndicator = (current, previous, inverted = false) => {
    if (!current || !previous) return null;

    let trend = current > previous;
    if (inverted) trend = !trend; // For metrics where lower is better (like inflation)

    const percentChange = Math.abs(
      ((current - previous) / previous) * 100
    ).toFixed(1);

    return (
      <span className={`trend-indicator ${trend ? "positive" : "negative"}`}>
        {trend ? "↑" : "↓"} {percentChange}%
      </span>
    );
  };

  // Render custom economic parameters form
  const renderCustomEconomicParams = () => {
    if (!formData.includeEconomicIndicators || !formData.customEconomicParams)
      return null;

    return (
      <div className="custom-economic-params">
        <h4>Custom Economic Parameters</h4>
        <p>Adjust these values to create scenario-based forecasts:</p>

        <div className="custom-params-grid">
          <div className="form-group">
            <label htmlFor="exchangeRate">USD/LKR Exchange Rate</label>
            <input
              type="number"
              id="exchangeRate"
              name="exchangeRate"
              value={customEconomicParams.exchangeRate}
              onChange={handleCustomParamChange}
              className="form-control"
              step="0.01"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="inflation">Inflation Rate (%)</label>
            <input
              type="number"
              id="inflation"
              name="inflation"
              value={customEconomicParams.inflation}
              onChange={handleCustomParamChange}
              className="form-control"
              step="0.1"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="gdpGrowth">GDP Growth Rate (%)</label>
            <input
              type="number"
              id="gdpGrowth"
              name="gdpGrowth"
              value={customEconomicParams.gdpGrowth}
              onChange={handleCustomParamChange}
              className="form-control"
              step="0.1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="exportGrowth">Export Growth Rate (%)</label>
            <input
              type="number"
              id="exportGrowth"
              name="exportGrowth"
              value={customEconomicParams.exportGrowth}
              onChange={handleCustomParamChange}
              className="form-control"
              step="0.1"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="forecast-generation">
      <div className="forecast-header">
        <h2>Revenue Forecast Generation</h2>
        <p>
          Create accurate revenue forecasts using real-time economic data and
          machine learning
        </p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="forecast-form-container">
        <h3>Generate New Forecast</h3>

        {dataCount < 3 ? (
          <div className="alert alert-warning">
            <p>
              You need at least 3 revenue data points to generate a forecast.
              Currently, you have {dataCount} data point(s).
            </p>
            <a href="/dashboard/data" className="btn btn-primary">
              Add Revenue Data
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="forecastType">Forecast Horizon</label>
                <select
                  id="forecastType"
                  name="forecastType"
                  value={formData.forecastType}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="short-term">Short-term (1-3 months)</option>
                  <option value="medium-term">Medium-term (3-12 months)</option>
                  <option value="long-term">Long-term (1-3 years)</option>
                </select>
                <small className="form-text text-muted">
                  Select the time frame for your forecast
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="modelType">Forecasting Method</label>
                <select
                  id="modelType"
                  name="modelType"
                  value={formData.modelType}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="arima">ARIMA (Time Series Analysis)</option>
                  <option value="prophet">
                    Prophet (Time Series Analysis)
                  </option>
                  <option value="randomForest">
                    Random Forest (Machine Learning)
                  </option>
                  <option value="ensemble">Ensemble (Combined Models)</option>
                </select>
                <small className="form-text text-muted">
                  Choose the algorithm used for prediction
                </small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="months">Number of Months to Forecast</label>
                <input
                  type="number"
                  id="months"
                  name="months"
                  value={formData.months}
                  onChange={handleInputChange}
                  className="form-control"
                  min="1"
                  max="36"
                  required
                />
                <small className="form-text text-muted">
                  Number of months to predict into the future (1-36)
                </small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-check">
                <input
                  type="checkbox"
                  id="includeEconomicIndicators"
                  name="includeEconomicIndicators"
                  checked={formData.includeEconomicIndicators}
                  onChange={handleInputChange}
                  className="form-check-input"
                />
                <label
                  htmlFor="includeEconomicIndicators"
                  className="form-check-label"
                >
                  Include Economic Indicators
                </label>
                <small className="form-text text-muted d-block">
                  Use real-time economic data like exchange rates and inflation
                  in the forecast
                </small>
              </div>

              <div className="form-check">
                <input
                  type="checkbox"
                  id="includeSeasonality"
                  name="includeSeasonality"
                  checked={formData.includeSeasonality}
                  onChange={handleInputChange}
                  className="form-check-input"
                />
                <label
                  htmlFor="includeSeasonality"
                  className="form-check-label"
                >
                  Include Seasonality
                </label>
                <small className="form-text text-muted d-block">
                  Account for seasonal patterns in revenue data
                </small>
              </div>

              {formData.includeEconomicIndicators && (
                <div className="form-check">
                  <input
                    type="checkbox"
                    id="customEconomicParams"
                    name="customEconomicParams"
                    checked={formData.customEconomicParams}
                    onChange={handleInputChange}
                    className="form-check-input"
                  />
                  <label
                    htmlFor="customEconomicParams"
                    className="form-check-label"
                  >
                    Use Custom Economic Parameters
                  </label>
                  <small className="form-text text-muted d-block">
                    Manually set economic indicators for scenario planning
                  </small>
                </div>
              )}
            </div>

            {renderEconomicDataSummary()}

            {renderCustomEconomicParams()}

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={generating}
              >
                {generating ? "Generating Forecast..." : "Generate Forecast"}
              </button>
            </div>

            <div className="forecast-info-box">
              <h4>About Forecasting Methods</h4>
              <p>
                <strong>ARIMA:</strong> Works well for time series data with
                clear patterns.
                <br />
                <strong>Prophet:</strong> Handles seasonal data with multiple
                patterns.
                <br />
                <strong>Random Forest:</strong> Learns complex relationships
                from economic indicators.
                <br />
                <strong>Ensemble:</strong> Combines multiple models for the most
                robust predictions.
              </p>
            </div>
          </form>
        )}
      </div>

      <div className="forecasts-list-container">
        <h3>Previous Forecasts</h3>

        {loading ? (
          <div className="loading-indicator">Loading forecasts...</div>
        ) : forecasts.length === 0 ? (
          <p className="no-data-message">No forecasts generated yet.</p>
        ) : (
          <div className="forecasts-grid">
            {forecasts.map((forecast) => (
              <div key={forecast._id} className="forecast-card">
                <div className="forecast-card-header">
                  <h4>{getTypeLabel(forecast.forecastType)} Forecast</h4>
                  <span className="forecast-date">
                    Generated on {formatDate(forecast.forecastDate)}
                  </span>
                </div>

                <div className="forecast-card-body">
                  <p>
                    <strong>Period:</strong>{" "}
                    {formatDate(forecast.forecastPeriod.start)} to{" "}
                    {formatDate(forecast.forecastPeriod.end)}
                  </p>
                  <p>
                    <strong>Model:</strong> {getModelLabel(forecast.modelType)}
                  </p>
                  <p>
                    <strong>Accuracy (MAPE):</strong>{" "}
                    {forecast.accuracy.mape.toFixed(2)}%
                  </p>
                  <p>
                    <strong>Data Points:</strong> {forecast.forecastData.length}
                  </p>

                  {forecast.factors && (
                    <div className="forecast-factors">
                      {forecast.factors.economicIndicators?.included && (
                        <span className="factor-badge economic">
                          Economic Indicators
                        </span>
                      )}
                      {forecast.factors.seasonality?.included && (
                        <span className="factor-badge seasonal">
                          Seasonality
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="forecast-card-footer">
                  <button
                    className="btn btn-info"
                    onClick={() =>
                      navigate(
                        `/dashboard/visualizations?forecast=${forecast._id}`
                      )
                    }
                  >
                    View Details
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(forecast._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForecastGeneration;
