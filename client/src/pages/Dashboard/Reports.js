// client/src/pages/Dashboard/LiveData.js

import React, { useState, useEffect } from "react";
import {
  getLiveEconomicData,
  getHistoricalEconomicData,
} from "../../api/economic.api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import "./Dashboard.css";

const LiveData = () => {
  const [liveData, setLiveData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Function to fetch live data
  const fetchLiveData = async () => {
    try {
      setIsLoading(true);
      const response = await getLiveEconomicData();

      if (response.success) {
        setLiveData(response.data);
        setLastUpdated(new Date());
        setError("");
      } else {
        setError("Failed to fetch live economic data");
      }
    } catch (err) {
      setError(`Error: ${err.userMessage || err.message}`);
      console.error("Error fetching live data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch historical data
  const fetchHistoricalData = async () => {
    try {
      // Get data from the last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const response = await getHistoricalEconomicData({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      if (response.success) {
        // Format data for charts
        const formattedData = response.data.map((item) => ({
          date: new Date(item.date).toLocaleDateString(),
          exchangeRate: item.exchangeRate,
          inflation: item.inflation,
          cottonPrice: item.cottonPrice,
        }));

        setHistoricalData(formattedData.reverse()); // Reverse to show oldest to newest
        setError("");
      } else {
        setError("Failed to fetch historical economic data");
      }
    } catch (err) {
      setError(`Error: ${err.userMessage || err.message}`);
      console.error("Error fetching historical data:", err);
    }
  };

  // Set up initial data load and auto-refresh
  useEffect(() => {
    // Initial data load
    fetchLiveData();
    fetchHistoricalData();

    // Set up auto-refresh every 5 minutes (300000 ms)
    const interval = setInterval(() => {
      fetchLiveData();
    }, 300000);

    setRefreshInterval(interval);

    // Clean up interval on component unmount
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchLiveData();
    fetchHistoricalData();
  };

  // Change refresh rate
  const handleRefreshRateChange = (minutes) => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }

    const newInterval = setInterval(() => {
      fetchLiveData();
    }, minutes * 60000);

    setRefreshInterval(newInterval);
  };

  // Function to determine trend icon and class
  const getTrendInfo = (current, previous) => {
    if (!previous || current === previous)
      return { icon: "→", className: "neutral" };

    if (current > previous) {
      return { icon: "↑", className: "positive" };
    } else {
      return { icon: "↓", className: "negative" };
    }
  };

  return (
    <div className="live-data-container">
      <div className="live-data-header">
        <h2>Live Economic Indicators</h2>
        <div className="refresh-controls">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="refresh-button"
          >
            {isLoading ? "Refreshing..." : "Refresh Now"}
          </button>
          <div className="refresh-rate">
            <span>Auto-refresh: </span>
            <select
              onChange={(e) =>
                handleRefreshRateChange(parseInt(e.target.value))
              }
              defaultValue="5"
              className="refresh-select"
            >
              <option value="1">1 minute</option>
              <option value="5">5 minutes</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
            </select>
          </div>
          {lastUpdated && (
            <div className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="live-data-grid">
        {/* Exchange Rate Card */}
        <div className="data-card exchange-rate">
          <h3>USD/LKR Exchange Rate</h3>
          <div className="card-content">
            {liveData?.usdLkrRate ? (
              <>
                <div className="current-value">
                  {liveData.usdLkrRate.toFixed(2)} LKR
                </div>
                <div className="indicator-details">
                  <p>1 USD = {liveData.usdLkrRate.toFixed(2)} LKR</p>
                  <p>
                    Last Updated:{" "}
                    {new Date(
                      liveData.lastUpdatedExchangeRate
                    ).toLocaleString()}
                  </p>
                </div>
                {historicalData.length > 0 && (
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={["auto", "auto"]} />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="exchangeRate"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            ) : (
              <div className="loading-placeholder">
                {isLoading
                  ? "Loading exchange rate data..."
                  : "Exchange rate data unavailable"}
              </div>
            )}
          </div>
        </div>

        {/* Inflation Rate Card */}
        <div className="data-card inflation-rate">
          <h3>Sri Lanka Inflation Rate</h3>
          <div className="card-content">
            {liveData?.inflationRate ? (
              <>
                <div className="current-value">
                  {liveData.inflationRate.toFixed(1)}%
                  {liveData.previousInflationRate && (
                    <span
                      className={`trend-indicator ${
                        getTrendInfo(
                          liveData.inflationRate,
                          liveData.previousInflationRate
                        ).className
                      }`}
                    >
                      {
                        getTrendInfo(
                          liveData.inflationRate,
                          liveData.previousInflationRate
                        ).icon
                      }
                    </span>
                  )}
                </div>
                <div className="indicator-details">
                  <p>Year-over-Year Inflation</p>
                  <p>Previous: {liveData.previousInflationRate?.toFixed(1)}%</p>
                  <p>
                    Last Updated:{" "}
                    {new Date(liveData.lastUpdatedInflation).toLocaleString()}
                  </p>
                </div>
                {historicalData.length > 0 && (
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={["auto", "auto"]} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="inflation"
                          stroke="#ff7300"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            ) : (
              <div className="loading-placeholder">
                {isLoading
                  ? "Loading inflation data..."
                  : "Inflation data unavailable"}
              </div>
            )}
          </div>
        </div>

        {/* Cotton Price Card */}
        <div className="data-card cotton-price">
          <h3>Global Cotton Price</h3>
          <div className="card-content">
            {liveData?.cottonPrice ? (
              <>
                <div className="current-value">
                  ${liveData.cottonPrice.toFixed(2)} USD
                  {liveData.cottonPriceChange && (
                    <span
                      className={`trend-indicator ${
                        liveData.cottonPriceChange >= 0
                          ? "positive"
                          : "negative"
                      }`}
                    >
                      {liveData.cottonPriceChange >= 0 ? "↑" : "↓"}
                      {Math.abs(liveData.cottonPriceChangePercent).toFixed(1)}%
                    </span>
                  )}
                </div>
                <div className="indicator-details">
                  <p>Per Pound</p>
                  <p>
                    Last Updated:{" "}
                    {new Date(liveData.lastUpdatedCottonPrice).toLocaleString()}
                  </p>
                </div>
                {historicalData.length > 0 && (
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={["auto", "auto"]} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="cottonPrice"
                          stroke="#82ca9d"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            ) : (
              <div className="loading-placeholder">
                {isLoading
                  ? "Loading cotton price data..."
                  : "Cotton price data unavailable"}
              </div>
            )}
          </div>
        </div>

        {/* Stock Market Indices Card */}
        <div className="data-card stock-indices">
          <h3>Global Market Indices</h3>
          <div className="card-content">
            {liveData?.stockIndices ? (
              <div className="stock-indices-grid">
                {liveData.stockIndices.map((index) => (
                  <div key={index.symbol} className="stock-index-item">
                    <div className="index-name">{index.symbol}</div>
                    <div className="index-value">{index.close.toFixed(2)}</div>
                    <div
                      className={`index-change ${
                        index.change_percent >= 0 ? "positive" : "negative"
                      }`}
                    >
                      {index.change_percent >= 0 ? "+" : ""}
                      {index.change_percent.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="loading-placeholder">
                {isLoading
                  ? "Loading market indices..."
                  : "Market indices unavailable"}
              </div>
            )}
          </div>
        </div>

        {/* Sri Lanka Garment Export Stats */}
        <div className="data-card export-stats">
          <h3>Garment Export Statistics</h3>
          <div className="card-content">
            {liveData?.exportStats ? (
              <div className="export-stats-content">
                <div className="stat-item">
                  <div className="stat-label">Monthly Exports</div>
                  <div className="stat-value">
                    ${liveData.exportStats.monthlyValue.toFixed(2)}M
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">YoY Change</div>
                  <div
                    className={`stat-value ${
                      liveData.exportStats.yoyChange >= 0
                        ? "positive"
                        : "negative"
                    }`}
                  >
                    {liveData.exportStats.yoyChange >= 0 ? "+" : ""}
                    {liveData.exportStats.yoyChange.toFixed(2)}%
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Top Destination</div>
                  <div className="stat-value">
                    {liveData.exportStats.topDestination}
                  </div>
                </div>
              </div>
            ) : (
              <div className="loading-placeholder">
                {isLoading
                  ? "Loading export statistics..."
                  : "Export statistics unavailable"}
              </div>
            )}
          </div>
        </div>

        {/* Currency Comparison Card */}
        <div className="data-card currency-comparison">
          <h3>Competitor Currency Rates (vs USD)</h3>
          <div className="card-content">
            {liveData?.currencies ? (
              <div className="currency-comparison-grid">
                <div className="currency-item">
                  <div className="currency-name">LKR (Sri Lanka)</div>
                  <div className="currency-value">
                    {liveData.usdLkrRate?.toFixed(2)}
                  </div>
                </div>
                <div className="currency-item">
                  <div className="currency-name">BDT (Bangladesh)</div>
                  <div className="currency-value">
                    {(1 / liveData.currencies.BDT)?.toFixed(2)}
                  </div>
                </div>
                <div className="currency-item">
                  <div className="currency-name">INR (India)</div>
                  <div className="currency-value">
                    {(1 / liveData.currencies.INR)?.toFixed(2)}
                  </div>
                </div>
                <div className="currency-item">
                  <div className="currency-name">VND (Vietnam)</div>
                  <div className="currency-value">
                    {(1 / liveData.currencies.VND)?.toFixed(2)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="loading-placeholder">
                {isLoading
                  ? "Loading currency data..."
                  : "Currency data unavailable"}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="economic-impact-section">
        <h3>Economic Impact Analysis</h3>
        <div className="impact-content">
          <p>
            <strong>Exchange Rate Trend:</strong>{" "}
            {liveData?.exchangeRateTrend || "Analysis unavailable"}
          </p>
          <p>
            <strong>Inflation Impact:</strong>{" "}
            {liveData?.inflationImpact || "Analysis unavailable"}
          </p>
          <p>
            <strong>Material Cost Forecast:</strong>{" "}
            {liveData?.materialCostForecast || "Analysis unavailable"}
          </p>
          <p>
            <strong>Market Outlook:</strong>{" "}
            {liveData?.marketOutlook || "Analysis unavailable"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveData;
