// DataManagement.js
import React, { useState, useEffect } from "react";
import { getRevenueData, uploadRevenueData } from "../../api/data.api";

const DataManagement = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getRevenueData();
      setData(response.data);
      setLoading(false);
    } catch (err) {
      setError("Error fetching data. Please try again.");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await uploadRevenueData(formData);
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
      // Refresh data
      fetchData();
    } catch (err) {
      setError("Error uploading data. Please try again.");
    }
  };

  return (
    <div className="data-management">
      <h2>Revenue Data Management</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="data-form-container">
        <h3>Add New Revenue Data</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
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
              required
            />
          </div>

          <h4>Economic Indicators</h4>

          <div className="form-group">
            <label htmlFor="exchangeRate">Exchange Rate (USD/LKR)</label>
            <input
              type="number"
              id="exchangeRate"
              name="economicIndicators.exchangeRate"
              value={formData.economicIndicators.exchangeRate}
              onChange={handleInputChange}
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
            />
          </div>

          <h4>Seasonal Factors</h4>

          <div className="form-check">
            <input
              type="checkbox"
              id="holidaySeason"
              name="seasonalFactors.holidaySeason"
              checked={formData.seasonalFactors.holidaySeason}
              onChange={handleInputChange}
            />
            <label htmlFor="holidaySeason">Holiday Season</label>
          </div>

          <div className="form-check">
            <input
              type="checkbox"
              id="peakMonth"
              name="seasonalFactors.peakMonth"
              checked={formData.seasonalFactors.peakMonth}
              onChange={handleInputChange}
            />
            <label htmlFor="peakMonth">Peak Month</label>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary">
            Add Data
          </button>
        </form>
      </div>

      <div className="data-table-container">
        <h3>Revenue Data History</h3>

        {loading ? (
          <p>Loading data...</p>
        ) : data.length === 0 ? (
          <p>No revenue data available. Please add data to begin.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Revenue (LKR)</th>
                <th>Costs (LKR)</th>
                <th>Profit (LKR)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item._id}>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td>{item.revenue.toLocaleString()}</td>
                  <td>{item.costs.toLocaleString()}</td>
                  <td>{item.profit.toLocaleString()}</td>
                  <td>
                    <button className="btn btn-sm btn-info">View</button>
                    <button className="btn btn-sm btn-warning">Edit</button>
                    <button className="btn btn-sm btn-danger">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DataManagement;
