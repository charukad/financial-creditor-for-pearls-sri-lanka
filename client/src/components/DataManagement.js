import React, { useState, useEffect } from "react";
import {
  getRevenueData,
  uploadRevenueData,
  deleteRevenueData,
} from "../../api/data.api";
import { formatCurrency, formatDate } from "../../utils/formatters";
import useAuth from "../../hooks/useAuth";
import "./DataManagement.css";

const DataManagement = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    revenue: "",
    costs: "",
    economicIndicators: {
      exchangeRate: "",
      inflation: "",
    },
    seasonalFactors: {
      holidaySeason: false,
      peakMonth: false,
    },
    notes: "",
  });
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkData, setBulkData] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "descending",
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Function to fetch revenue data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getRevenueData();

      if (response.success) {
        setData(response.data || []);
      } else {
        setError(response.error || "Failed to fetch data");
      }
    } catch (err) {
      setError("Error loading data. Please try again.");
      console.error("Data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change for form fields
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      // Handle nested fields like economicIndicators.exchangeRate
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      });
    } else {
      // Handle normal fields
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate form
    if (!formData.date || !formData.revenue || !formData.costs) {
      setError("Date, revenue, and costs are required fields");
      return;
    }

    try {
      setIsUploading(true);

      // Convert string values to numbers
      const dataToSubmit = {
        ...formData,
        revenue: parseFloat(formData.revenue),
        costs: parseFloat(formData.costs),
        economicIndicators: {
          ...formData.economicIndicators,
          exchangeRate: formData.economicIndicators.exchangeRate
            ? parseFloat(formData.economicIndicators.exchangeRate)
            : null,
          inflation: formData.economicIndicators.inflation
            ? parseFloat(formData.economicIndicators.inflation)
            : null,
        },
      };

      const response = await uploadRevenueData(dataToSubmit);

      if (response.success) {
        setSuccess("Data uploaded successfully");
        // Reset form
        setFormData({
          date: "",
          revenue: "",
          costs: "",
          economicIndicators: {
            exchangeRate: "",
            inflation: "",
          },
          seasonalFactors: {
            holidaySeason: false,
            peakMonth: false,
          },
          notes: "",
        });
        // Hide form
        setShowForm(false);
        // Refresh data
        fetchData();
      } else {
        setError(response.error || "Failed to upload data");
      }
    } catch (err) {
      setError("Error uploading data. Please try again.");
      console.error("Data upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle bulk data upload
  const handleBulkUpload = async () => {
    try {
      setIsUploading(true);
      setError(null);
      setSuccess(null);

      // Parse CSV data
      const lines = bulkData.trim().split("\n");
      const headers = lines[0].split(",").map((h) => h.trim());

      // Validate CSV structure
      const requiredColumns = ["date", "revenue", "costs"];
      const missingColumns = requiredColumns.filter(
        (col) => !headers.includes(col)
      );

      if (missingColumns.length > 0) {
        setError(
          `CSV is missing required columns: ${missingColumns.join(", ")}`
        );
        setIsUploading(false);
        return;
      }

      // Process data rows
      const dataEntries = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue; // Skip empty lines

        const values = lines[i].split(",").map((v) => v.trim());

        // Create data object
        const entry = {};
        headers.forEach((header, index) => {
          if (header === "date") {
            entry[header] = values[index];
          } else if (
            ["revenue", "costs", "exchangeRate", "inflation"].includes(header)
          ) {
            entry[header] = parseFloat(values[index]) || 0;
          } else if (["holidaySeason", "peakMonth"].includes(header)) {
            entry[header] = values[index].toLowerCase() === "true";
          } else {
            entry[header] = values[index];
          }
        });

        // Structure economic indicators and seasonal factors
        const formattedEntry = {
          date: entry.date,
          revenue: entry.revenue,
          costs: entry.costs,
          economicIndicators: {
            exchangeRate: entry.exchangeRate || null,
            inflation: entry.inflation || null,
          },
          seasonalFactors: {
            holidaySeason: entry.holidaySeason || false,
            peakMonth: entry.peakMonth || false,
          },
          notes: entry.notes || "",
        };

        dataEntries.push(formattedEntry);
      }

      if (dataEntries.length === 0) {
        setError("No valid data entries found in CSV");
        setIsUploading(false);
        return;
      }

      // Upload data in batches
      const response = await uploadBulkRevenueData(dataEntries);

      if (response.success) {
        setSuccess(`Successfully uploaded ${response.count} data entries`);
        setBulkData("");
        setShowBulkUpload(false);
        fetchData();
      } else {
        setError(response.error || "Failed to upload bulk data");
      }
    } catch (err) {
      setError("Error processing bulk data. Please check your CSV format.");
      console.error("Bulk upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle data deletion
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this data entry? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      const response = await deleteRevenueData(id);

      if (response.success) {
        setSuccess("Data deleted successfully");
        fetchData();
      } else {
        setError(response.error || "Failed to delete data");
      }
    } catch (err) {
      setError("Error deleting data. Please try again.");
      console.error("Data deletion error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle sorting
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Get sorted data
  const getSortedData = () => {
    const sortableData = [...data];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle nested values like profit
        if (sortConfig.key === "profit") {
          aValue = a.revenue - a.costs;
          bValue = b.revenue - b.costs;
        }

        // Handle date sorting
        if (sortConfig.key === "date") {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  };

  // Calculate summary statistics
  const calculateSummary = () => {
    if (!data.length) return null;

    const summary = {
      totalRevenue: data.reduce((sum, item) => sum + item.revenue, 0),
      totalCosts: data.reduce((sum, item) => sum + item.costs, 0),
      totalProfit: data.reduce(
        (sum, item) => sum + (item.revenue - item.costs),
        0
      ),
      averageRevenue:
        data.reduce((sum, item) => sum + item.revenue, 0) / data.length,
      averageProfit:
        data.reduce((sum, item) => sum + (item.revenue - item.costs), 0) /
        data.length,
      profitMargin:
        (data.reduce((sum, item) => sum + (item.revenue - item.costs), 0) /
          data.reduce((sum, item) => sum + item.revenue, 0)) *
        100,
    };

    return summary;
  };

  const summary = calculateSummary();
  const sortedData = getSortedData();

  return (
    <div className="data-management">
      <div className="data-management-header">
        <h2>Revenue Data Management</h2>
        <p>Manage your historical revenue data for forecasting</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="data-actions">
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            setShowBulkUpload(false);
          }}
        >
          {showForm ? "Cancel" : "Add New Data Entry"}
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => {
            setShowBulkUpload(!showBulkUpload);
            setShowForm(false);
          }}
        >
          {showBulkUpload ? "Cancel" : "Bulk Upload"}
        </button>
      </div>

      {showForm && (
        <div className="data-form-container">
          <h3>Add New Revenue Data</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="revenue">Revenue (LKR)</label>
                <input
                  type="number"
                  id="revenue"
                  name="revenue"
                  value={formData.revenue}
                  onChange={handleInputChange}
                  className="form-control"
                  min="0"
                  step="1000"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="costs">Costs (LKR)</label>
                <input
                  type="number"
                  id="costs"
                  name="costs"
                  value={formData.costs}
                  onChange={handleInputChange}
                  className="form-control"
                  min="0"
                  step="1000"
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h4>Economic Indicators</h4>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="exchangeRate">Exchange Rate (USD/LKR)</label>
                  <input
                    type="number"
                    id="exchangeRate"
                    name="economicIndicators.exchangeRate"
                    value={formData.economicIndicators.exchangeRate}
                    onChange={handleInputChange}
                    className="form-control"
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="inflation">Inflation Rate (%)</label>
                  <input
                    type="number"
                    id="inflation"
                    name="economicIndicators.inflation"
                    value={formData.economicIndicators.inflation}
                    onChange={handleInputChange}
                    className="form-control"
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Seasonal Factors</h4>
              <div className="form-row">
                <div className="form-check">
                  <input
                    type="checkbox"
                    id="holidaySeason"
                    name="seasonalFactors.holidaySeason"
                    checked={formData.seasonalFactors.holidaySeason}
                    onChange={handleInputChange}
                    className="form-check-input"
                  />
                  <label htmlFor="holidaySeason" className="form-check-label">
                    Holiday Season
                  </label>
                </div>

                <div className="form-check">
                  <input
                    type="checkbox"
                    id="peakMonth"
                    name="seasonalFactors.peakMonth"
                    checked={formData.seasonalFactors.peakMonth}
                    onChange={handleInputChange}
                    className="form-check-input"
                  />
                  <label htmlFor="peakMonth" className="form-check-label">
                    Peak Month
                  </label>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="form-control"
                rows="3"
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isUploading}
            >
              {isUploading ? "Saving..." : "Save Data"}
            </button>
          </form>
        </div>
      )}

      {showBulkUpload && (
        <div className="bulk-upload-container">
          <h3>Bulk Upload Revenue Data</h3>
          <p className="help-text">
            Upload multiple data entries using CSV format. The first row should
            contain headers. Required columns: date, revenue, costs. Optional
            columns: exchangeRate, inflation, holidaySeason, peakMonth, notes.
          </p>

          <div className="csv-template">
            <h4>CSV Template</h4>
            <code>
              date,revenue,costs,exchangeRate,inflation,holidaySeason,peakMonth,notes
            </code>
            <br />
            <code>
              2025-03-01,1500000,1200000,300.5,6.2,true,false,March sales
            </code>
          </div>

          <div className="form-group">
            <label htmlFor="bulkData">Paste CSV Data</label>
            <textarea
              id="bulkData"
              name="bulkData"
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              className="form-control"
              rows="10"
              placeholder="Paste your CSV data here..."
              required
            ></textarea>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleBulkUpload}
            disabled={isUploading || !bulkData.trim()}
          >
            {isUploading ? "Uploading..." : "Upload Data"}
          </button>
        </div>
      )}

      {/* Data Summary */}
      {summary && (
        <div className="data-summary">
          <h3>Data Summary</h3>
          <div className="summary-grid">
            <div className="summary-card">
              <h4>Total Revenue</h4>
              <div className="summary-value">
                {formatCurrency(summary.totalRevenue)}
              </div>
            </div>

            <div className="summary-card">
              <h4>Total Costs</h4>
              <div className="summary-value">
                {formatCurrency(summary.totalCosts)}
              </div>
            </div>

            <div className="summary-card">
              <h4>Total Profit</h4>
              <div className="summary-value">
                {formatCurrency(summary.totalProfit)}
              </div>
            </div>

            <div className="summary-card">
              <h4>Profit Margin</h4>
              <div className="summary-value">
                {summary.profitMargin.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="data-table-container">
        <h3>Revenue Data History</h3>

        {loading ? (
          <div className="loading-spinner">Loading data...</div>
        ) : data.length === 0 ? (
          <div className="no-data-message">
            <p>No revenue data available. Please add data to begin.</p>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th
                    onClick={() => requestSort("date")}
                    className={
                      sortConfig.key === "date" ? sortConfig.direction : ""
                    }
                  >
                    Date
                  </th>
                  <th
                    onClick={() => requestSort("revenue")}
                    className={
                      sortConfig.key === "revenue" ? sortConfig.direction : ""
                    }
                  >
                    Revenue (LKR)
                  </th>
                  <th
                    onClick={() => requestSort("costs")}
                    className={
                      sortConfig.key === "costs" ? sortConfig.direction : ""
                    }
                  >
                    Costs (LKR)
                  </th>
                  <th
                    onClick={() => requestSort("profit")}
                    className={
                      sortConfig.key === "profit" ? sortConfig.direction : ""
                    }
                  >
                    Profit (LKR)
                  </th>
                  <th>Economic Indicators</th>
                  <th>Seasonal Factors</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((item) => (
                  <tr key={item._id}>
                    <td>{formatDate(item.date)}</td>
                    <td>{formatCurrency(item.revenue)}</td>
                    <td>{formatCurrency(item.costs)}</td>
                    <td>{formatCurrency(item.revenue - item.costs)}</td>
                    <td>
                      {item.economicIndicators && (
                        <>
                          {item.economicIndicators.exchangeRate && (
                            <div>
                              Exchange Rate:{" "}
                              {item.economicIndicators.exchangeRate}
                            </div>
                          )}
                          {item.economicIndicators.inflation && (
                            <div>
                              Inflation: {item.economicIndicators.inflation}%
                            </div>
                          )}
                        </>
                      )}
                    </td>
                    <td>
                      {item.seasonalFactors && (
                        <>
                          {item.seasonalFactors.holidaySeason && (
                            <div>Holiday Season</div>
                          )}
                          {item.seasonalFactors.peakMonth && (
                            <div>Peak Month</div>
                          )}
                        </>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(item._id)}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="data-info">Showing {data.length} data entries</div>
          </>
        )}
      </div>
    </div>
  );
};

export default DataManagement;
