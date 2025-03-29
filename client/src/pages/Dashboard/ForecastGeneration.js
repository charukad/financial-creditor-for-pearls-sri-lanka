import React, { useState, useEffect } from "react";
import {
  generateForecast,
  getForecasts,
  deleteForecast,
} from "../../api/forecast.api";
import { getRevenueData } from "../../api/data.api";

const ForecastGeneration = () => {
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataCount, setDataCount] = useState(0);
  const [formData, setFormData] = useState({
    forecastType: "medium-term",
    months: 6,
    includeEconomicIndicators: true,
  });
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchForecasts();
    checkDataAvailability();
  }, []);

  const fetchForecasts = async () => {
    try {
      setLoading(true);
      const response = await getForecasts();
      setForecasts(response.data);
      setLoading(false);
    } catch (err) {
      setError("Error fetching forecasts. Please try again.");
      setLoading(false);
    }
  };

  const checkDataAvailability = async () => {
    try {
      const response = await getRevenueData();
      setDataCount(response.count || 0);
    } catch (err) {
      console.error("Error checking data availability:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (dataCount < 3) {
      setError(
        "Not enough revenue data to generate a forecast. Please add at least 3 data points."
      );
      return;
    }

    try {
      setGenerating(true);
      setError(null);

      await generateForecast(formData);

      // Refresh forecasts
      await fetchForecasts();

      setGenerating(false);
    } catch (err) {
      setError("Error generating forecast. Please try again.");
      setGenerating(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this forecast?")) {
      try {
        await deleteForecast(id);
        // Refresh forecasts
        fetchForecasts();
      } catch (err) {
        setError("Error deleting forecast. Please try again.");
      }
    }
  };

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

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="forecast-generation">
      <h2>Revenue Forecast Generation</h2>

      {error && <div className="alert alert-danger">{error}</div>}

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
            <div className="form-group">
              <label htmlFor="forecastType">Forecast Type</label>
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
            </div>

            <div className="form-group">
              <label htmlFor="months">Number of Months to Forecast</label>
              <input
                type="number"
                id="months"
                name="months"
                min="1"
                max="36"
                value={formData.months}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>

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
              <small className="form-text text-muted">
                Consider economic factors like exchange rates and inflation in
                the forecast
              </small>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={generating}
            >
              {generating ? "Generating..." : "Generate Forecast"}
            </button>
          </form>
        )}
      </div>

      <div className="forecasts-list-container">
        <h3>Previous Forecasts</h3>

        {loading ? (
          <p>Loading forecasts...</p>
        ) : forecasts.length === 0 ? (
          <p>No forecasts generated yet.</p>
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
                    <strong>Model:</strong> {forecast.modelType}
                  </p>
                  <p>
                    <strong>Accuracy (MAPE):</strong>{" "}
                    {forecast.accuracy.mape.toFixed(2)}%
                  </p>
                  <p>
                    <strong>Data Points:</strong> {forecast.forecastData.length}
                  </p>
                </div>

                <div className="forecast-card-footer">
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() =>
                      (window.location.href = `/dashboard/visualizations?forecast=${forecast._id}`)
                    }
                  >
                    View Details
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
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
