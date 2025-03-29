import React from "react";
import { Link } from "react-router-dom";
import "./landing.css";

const Landing = () => {
  return (
    <div className="landing-page">
      <header>
        <h1>Revenue Prediction for Sri Lankan Garment Industry</h1>
        <p>
          Advanced machine learning solutions for accurate revenue forecasting
        </p>
        <div className="cta-buttons">
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
          <Link to="/register" className="btn btn-secondary">
            Create Account
          </Link>
        </div>
      </header>

      <section className="features">
        <h2>Key Features</h2>
        <div className="feature-list">
          <div className="feature">
            <h3>Accurate Forecasting</h3>
            <p>Using advanced models like ARIMA, Prophet, and Random Forest</p>
          </div>
          <div className="feature">
            <h3>Interactive Visualizations</h3>
            <p>
              Understand trends and patterns with powerful data visualizations
            </p>
          </div>
          <div className="feature">
            <h3>Real-time Updates</h3>
            <p>Get the latest forecasts based on current economic conditions</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
