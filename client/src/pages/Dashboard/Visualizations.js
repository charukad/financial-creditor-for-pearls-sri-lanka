import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
  BarChart,
  Bar,
  ComposedChart,
  Scatter,
} from "recharts";
import { getRevenueData } from "../../api/data.api";
import { getForecastById } from "../../api/forecast.api";

const Visualizations = () => {
  const [historicalData, setHistoricalData] = useState([]);
  const [forecastData, setForecastData] = useState(null);
  const [combinedData, setCombinedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState("line");
  const [timeframe, setTimeframe] = useState("all");

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const forecastId = queryParams.get("forecast");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch historical revenue data
        const historyResponse = await getRevenueData();
        const histData = historyResponse.data || [];
        setHistoricalData(histData);

        // If forecast ID is provided, fetch the forecast data
        if (forecastId) {
          const forecastResponse = await getForecastById(forecastId);
          const forecastData = forecastResponse.data;
          setForecastData(forecastData);

          // Combine historical and forecast data for charts
          prepareCombinedData(histData, forecastData);
        } else {
          prepareCombinedData(histData, null);
        }

        setLoading(false);
      } catch (err) {
        setError("Error fetching data. Please try again.");
        setLoading(false);
      }
    };

    fetchData();
  }, [forecastId]);

  const prepareCombinedData = (historical, forecast) => {
    // Sort historical data by date
    const sortedHistorical = [...historical].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // Prepare historical data for charting
    const histChartData = sortedHistorical.map((item) => ({
      date: new Date(item.date),
      revenue: item.revenue,
      costs: item.costs,
      profit: item.profit,
      month: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
    }));

    if (!forecast) {
      setCombinedData(histChartData);
      return;
    }

    // Prepare forecast data for charting
    const forecastChartData = forecast.forecastData.map((item) => ({
      date: new Date(item.date),
      predictedRevenue: item.revenue.predicted,
      lowerBound: item.revenue.lowerBound,
      upperBound: item.revenue.upperBound,
      month: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
    }));

    // Combine both datasets
    const combined = [...histChartData, ...forecastChartData].sort(
      (a, b) => a.date - b.date
    );

    setCombinedData(combined);
  };

  const formatCurrency = (value) => {
    return `LKR ${Number(value).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const filterDataByTimeframe = (data) => {
    if (timeframe === "all") return data;

    const now = new Date();
    let cutoffDate;

    switch (timeframe) {
      case "6m":
        cutoffDate = new Date(now.setMonth(now.getMonth() - 6));
        break;
      case "1y":
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case "2y":
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 2));
        break;
      default:
        return data;
    }

    return data.filter((item) => item.date >= cutoffDate);
  };

  // Filter data based on selected timeframe
  const filteredData = filterDataByTimeframe(combinedData);

  return (
    <div className="visualizations">
      <h2>Revenue Analytics & Forecasting Dashboard</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="loading-spinner">
          <p>Loading data...</p>
        </div>
      ) : (
        <>
          <div className="visualization-controls">
            <div className="control-group">
              <label>Chart Type:</label>
              <div className="btn-group">
                <button
                  className={`btn ${
                    chartType === "line" ? "btn-primary" : "btn-outline-primary"
                  }`}
                  onClick={() => setChartType("line")}
                >
                  Line
                </button>
                <button
                  className={`btn ${
                    chartType === "area" ? "btn-primary" : "btn-outline-primary"
                  }`}
                  onClick={() => setChartType("area")}
                >
                  Area
                </button>
                <button
                  className={`btn ${
                    chartType === "bar" ? "btn-primary" : "btn-outline-primary"
                  }`}
                  onClick={() => setChartType("bar")}
                >
                  Bar
                </button>
                <button
                  className={`btn ${
                    chartType === "composed"
                      ? "btn-primary"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => setChartType("composed")}
                >
                  Combined
                </button>
              </div>
            </div>

            <div className="control-group">
              <label>Timeframe:</label>
              <div className="btn-group">
                <button
                  className={`btn ${
                    timeframe === "all" ? "btn-primary" : "btn-outline-primary"
                  }`}
                  onClick={() => setTimeframe("all")}
                >
                  All Data
                </button>
                <button
                  className={`btn ${
                    timeframe === "6m" ? "btn-primary" : "btn-outline-primary"
                  }`}
                  onClick={() => setTimeframe("6m")}
                >
                  Last 6 Months
                </button>
                <button
                  className={`btn ${
                    timeframe === "1y" ? "btn-primary" : "btn-outline-primary"
                  }`}
                  onClick={() => setTimeframe("1y")}
                >
                  Last Year
                </button>
                <button
                  className={`btn ${
                    timeframe === "2y" ? "btn-primary" : "btn-outline-primary"
                  }`}
                  onClick={() => setTimeframe("2y")}
                >
                  Last 2 Years
                </button>
              </div>
            </div>
          </div>

          <div className="chart-container">
            <h3>Revenue Trends & Forecast</h3>

            {combinedData.length === 0 ? (
              <p>
                No data available to visualize. Please add revenue data to see
                charts.
              </p>
            ) : (
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={400}>
                  {chartType === "line" && (
                    <LineChart
                      data={filteredData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tickFormatter={(value) =>
                          `${(value / 1000000).toFixed(1)}M`
                        }
                        label={{
                          value: "LKR (Millions)",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      {/* Historical data */}
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3498db"
                        name="Actual Revenue"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="costs"
                        stroke="#e74c3c"
                        name="Costs"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="#2ecc71"
                        name="Profit"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                      />
                      {/* Forecast data */}
                      {forecastData && (
                        <>
                          <Line
                            type="monotone"
                            dataKey="predictedRevenue"
                            stroke="#9b59b6"
                            name="Forecasted Revenue"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{ r: 3, fill: "#9b59b6" }}
                          />
                          <Line
                            type="monotone"
                            dataKey="upperBound"
                            stroke="#bdc3c7"
                            name="Upper Bound"
                            strokeWidth={1}
                            strokeDasharray="3 3"
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="lowerBound"
                            stroke="#bdc3c7"
                            name="Lower Bound"
                            strokeWidth={1}
                            strokeDasharray="3 3"
                            dot={false}
                          />
                        </>
                      )}
                    </LineChart>
                  )}

                  {chartType === "area" && (
                    <AreaChart
                      data={filteredData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis
                        tickFormatter={(value) =>
                          `${(value / 1000000).toFixed(1)}M`
                        }
                      />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stackId="1"
                        stroke="#3498db"
                        fill="#3498db"
                        name="Revenue"
                      />
                      <Area
                        type="monotone"
                        dataKey="costs"
                        stackId="2"
                        stroke="#e74c3c"
                        fill="#e74c3c"
                        name="Costs"
                      />
                      {forecastData && (
                        <>
                          <Area
                            type="monotone"
                            dataKey="predictedRevenue"
                            stroke="#9b59b6"
                            fill="#9b59b6"
                            fillOpacity={0.3}
                            name="Forecasted Revenue"
                          />
                          <Area
                            type="monotone"
                            dataKey="upperBound"
                            dataKey="lowerBound"
                            stroke="none"
                            fill="#9b59b6"
                            fillOpacity={0.1}
                            name="Confidence Interval"
                          />
                        </>
                      )}
                    </AreaChart>
                  )}

                  {chartType === "bar" && (
                    <BarChart
                      data={filteredData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis
                        tickFormatter={(value) =>
                          `${(value / 1000000).toFixed(1)}M`
                        }
                      />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Bar
                        dataKey="revenue"
                        fill="#3498db"
                        name="Actual Revenue"
                      />
                      <Bar dataKey="costs" fill="#e74c3c" name="Costs" />
                      <Bar dataKey="profit" fill="#2ecc71" name="Profit" />
                      {forecastData && (
                        <Bar
                          dataKey="predictedRevenue"
                          fill="#9b59b6"
                          name="Forecasted Revenue"
                        />
                      )}
                    </BarChart>
                  )}

                  {chartType === "composed" && (
                    <ComposedChart
                      data={filteredData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis
                        tickFormatter={(value) =>
                          `${(value / 1000000).toFixed(1)}M`
                        }
                      />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Bar
                        dataKey="revenue"
                        fill="#3498db"
                        name="Actual Revenue"
                      />
                      <Bar dataKey="costs" fill="#e74c3c" name="Costs" />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="#2ecc71"
                        strokeWidth={2}
                        name="Profit"
                      />
                      {forecastData && (
                        <>
                          <Line
                            type="monotone"
                            dataKey="predictedRevenue"
                            stroke="#9b59b6"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            name="Forecasted Revenue"
                          />
                          <Area
                            type="monotone"
                            dataKey="upperBound"
                            data={filteredData.filter((d) => d.upperBound)}
                            stroke="none"
                            fill="#9b59b6"
                            fillOpacity={0.1}
                            name="Upper Bound"
                          />
                          <Area
                            type="monotone"
                            dataKey="lowerBound"
                            data={filteredData.filter((d) => d.lowerBound)}
                            stroke="none"
                            fill="#9b59b6"
                            fillOpacity={0.1}
                            name="Lower Bound"
                          />
                        </>
                      )}
                    </ComposedChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {forecastData && (
            <div className="visualization-section">
              <h3>Forecast Analysis</h3>

              <div className="forecast-metrics">
                <div className="metric-card">
                  <h4>Forecast Accuracy</h4>
                  <div className="metric-value">
                    {forecastData.accuracy.mape.toFixed(2)}%
                  </div>
                  <div className="metric-label">
                    MAPE (Mean Absolute Percentage Error)
                  </div>
                </div>

                <div className="metric-card">
                  <h4>Revenue Growth</h4>
                  <div className="metric-value">
                    {forecastData.forecastData.length > 0
                      ? (
                          (forecastData.forecastData[
                            forecastData.forecastData.length - 1
                          ].revenue.predicted /
                            forecastData.forecastData[0].revenue.predicted -
                            1) *
                          100
                        ).toFixed(2) + "%"
                      : "N/A"}
                  </div>
                  <div className="metric-label">
                    Predicted Growth Over Forecast Period
                  </div>
                </div>

                <div className="metric-card">
                  <h4>Forecast Period</h4>
                  <div className="metric-value">
                    {formatDate(forecastData.forecastPeriod.start)} -{" "}
                    {formatDate(forecastData.forecastPeriod.end)}
                  </div>
                  <div className="metric-label">
                    {forecastData.forecastData.length} Months
                  </div>
                </div>
              </div>

              <div className="forecast-insights">
                <h4>Key Insights</h4>
                <ul>
                  <li>
                    <strong>Seasonality Impact:</strong> The forecast model has
                    detected seasonal patterns in your revenue data.
                  </li>
                  {forecastData.factors.economicIndicators.included && (
                    <li>
                      <strong>Economic Indicators:</strong> This forecast
                      incorporates economic factors such as exchange rates and
                      inflation.
                    </li>
                  )}
                  <li>
                    <strong>Confidence Level:</strong> The forecast's confidence
                    intervals indicate the range of possible outcomes.
                  </li>
                </ul>
              </div>
            </div>
          )}

          <div className="visualization-section">
            <h3>Data Summary</h3>

            <div className="data-summary-grid">
              <div className="summary-card">
                <h4>Total Revenue</h4>
                <div className="summary-value">
                  {formatCurrency(
                    historicalData.reduce((sum, item) => sum + item.revenue, 0)
                  )}
                </div>
              </div>

              <div className="summary-card">
                <h4>Average Monthly Revenue</h4>
                <div className="summary-value">
                  {formatCurrency(
                    historicalData.length > 0
                      ? historicalData.reduce(
                          (sum, item) => sum + item.revenue,
                          0
                        ) / historicalData.length
                      : 0
                  )}
                </div>
              </div>

              <div className="summary-card">
                <h4>Total Profit</h4>
                <div className="summary-value">
                  {formatCurrency(
                    historicalData.reduce((sum, item) => sum + item.profit, 0)
                  )}
                </div>
              </div>

              <div className="summary-card">
                <h4>Profit Margin</h4>
                <div className="summary-value">
                  {historicalData.length > 0
                    ? (
                        (historicalData.reduce(
                          (sum, item) => sum + item.profit,
                          0
                        ) /
                          historicalData.reduce(
                            (sum, item) => sum + item.revenue,
                            0
                          )) *
                        100
                      ).toFixed(2) + "%"
                    : "0%"}
                </div>
              </div>
            </div>
          </div>

          <div className="visualization-actions">
            <button className="btn btn-primary">Export as PDF</button>
            <button className="btn btn-secondary">Save to Dashboard</button>
            <button className="btn btn-info">Share Report</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Visualizations;
