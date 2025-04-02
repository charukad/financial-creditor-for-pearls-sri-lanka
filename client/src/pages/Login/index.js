// client/src/pages/Login/index.js

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth"; // Corrected import with curly braces
import "./login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Attempt to login
      await login(formData.email, formData.password);

      // If successful, redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <h2>Login to Revenue Prediction</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="login-links">
          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>

      <div className="login-info">
        <h3>Revenue Prediction for Sri Lankan Garment Industry</h3>
        <p>
          Access powerful forecasting tools to make data-driven decisions for
          your garment business. Our machine learning models help you predict
          revenue with greater accuracy, taking into account economic factors,
          seasonal patterns, and industry trends.
        </p>
        <ul className="feature-list">
          <li>Advanced revenue forecasting using machine learning</li>
          <li>Real-time economic indicators and market analysis</li>
          <li>Comprehensive data visualization and reporting</li>
          <li>Industry-specific insights for the garment sector</li>
        </ul>
      </div>
    </div>
  );
};

export default Login;
