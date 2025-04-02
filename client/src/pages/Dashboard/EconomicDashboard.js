// client/src/pages/Dashboard/EconomicDashboard.js
import React, { useState, useEffect } from "react";
import {
  getCurrentExchangeRates,
  getEconomicIndicators,
} from "../../api/economic.api";
import "./EconomicDashboard.css";

const EconomicDashboard = () => {
  const [exchangeRates, setExchangeRates] = useState(null);
  const [indicators, setIndicators] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();

    // Set up auto-refresh every 30 minutes
    const refreshInterval = setInterval(fetchData, 30 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch exchange rates and economic indicators in parallel
      const [ratesResponse, indicatorsResponse] = await Promise.all([
        getCurrentExchangeRates(),
        getEconomicIndicators(),
      ]);

      setExchangeRates(ratesResponse.data);
      setIndicators(indicatorsResponse.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch economic data. Please try again.");
      console.error("Economic data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format currency value
  const formatCurrency = (value, decimals = 2) => {
    return parseFloat(value).toFixed(decimals);
  };

  return (
    <div className="economic-dashboard">
      <div className="dashboard-header">
        <h2>Economic Indicators Dashboard</h2>
        <p>Real-time economic data affecting the Sri Lankan garment industry</p>

        <div className="refresh-control">
          <span className="last-updated">
            Last updated:{" "}
            {loading
              ? "Updating..."
              : exchangeRates?.lastUpdated
              ? formatDate(exchangeRates.lastUpdated)
              : "Unknown"}
          </span>
          <button
            className="refresh-btn"
            onClick={fetchData}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="dashboard-content">
        {loading && !exchangeRates ? (
          <div className="loading-indicator">Loading economic data...</div>
        ) : (
          <>
            {/* Exchange Rates Panel */}
            <div className="dashboard-panel">
              <div className="panel-header">
                <h3>Currency Exchange Rates</h3>
              </div>

              <div className="exchange-rates-grid">
                <div className="exchange-rate-card">
                  <div className="rate-title">USD/LKR</div>
                  <div className="rate-value">
                    {formatCurrency(exchangeRates?.USD_LKR)}
                  </div>
                  <div className="rate-label">
                    US Dollar to Sri Lankan Rupee
                  </div>
                </div>

                <div className="exchange-rate-card">
                  <div className="rate-title">EUR/LKR</div>
                  <div className="rate-value">
                    {formatCurrency(exchangeRates?.EUR_LKR)}
                  </div>
                  <div className="rate-label">Euro to Sri Lankan Rupee</div>
                </div>

                <div className="exchange-rate-card">
                  <div className="rate-title">GBP/LKR</div>
                  <div className="rate-value">
                    {formatCurrency(exchangeRates?.GBP_LKR)}
                  </div>
                  <div className="rate-label">
                    British Pound to Sri Lankan Rupee
                  </div>
                </div>
              </div>
            </div>

            {/* Economic Indicators Panel */}
            <div className="dashboard-panel">
              <div className="panel-header">
                <h3>Economic Indicators</h3>
              </div>

              <div className="indicators-grid">
                <div className="indicator-card">
                  <div className="indicator-title">Inflation Rate</div>
                  <div className="indicator-value">
                    {indicators?.inflation}%
                  </div>
                  <div className="indicator-label">Annual rate</div>
                </div>

                <div className="indicator-card">
                  <div className="indicator-title">GDP Growth</div>
                  <div className="indicator-value">
                    {indicators?.gdpGrowth}%
                  </div>
                  <div className="indicator-label">Year-over-year</div>
                </div>

                <div className="indicator-card">
                  <div className="indicator-title">Interest Rate</div>
                  <div className="indicator-value">
                    {indicators?.interestRate}%
                  </div>
                  <div className="indicator-label">Central Bank rate</div>
                </div>

                <div className="indicator-card">
                  <div className="indicator-title">Export Growth</div>
                  <div className="indicator-value">
                    {indicators?.exportGrowth}%
                  </div>
                  <div className="indicator-label">Year-over-year</div>
                </div>
              </div>
            </div>

            {/* Industry Indicators Panel */}
            <div className="dashboard-panel">
              <div className="panel-header">
                <h3>Garment Industry Indicators</h3>
              </div>

              <div className="indicators-grid">
                <div className="indicator-card">
                  <div className="indicator-title">Cotton Price</div>
                  <div className="indicator-value">
                    ${formatCurrency(indicators?.cottonPrice)}
                  </div>
                  <div className="indicator-label">Per pound</div>
                </div>

                <div className="indicator-card">
                  <div className="indicator-title">Labor Cost Index</div>
                  <div className="indicator-value">
                    {indicators?.laborCostIndex}
                  </div>
                  <div className="indicator-label">Base 100</div>
                </div>

                <div className="indicator-card">
                  <div className="indicator-title">Global Demand</div>
                  <div className="indicator-value">
                    {indicators?.globalDemandIndex}
                  </div>
                  <div className="indicator-label">Industry index</div>
                </div>

                <div className="indicator-card">
                  <div className="indicator-title">Competitor Index</div>
                  <div className="indicator-value">
                    {indicators?.competitorIndex}
                  </div>
                  <div className="indicator-label">Regional performance</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EconomicDashboard;
