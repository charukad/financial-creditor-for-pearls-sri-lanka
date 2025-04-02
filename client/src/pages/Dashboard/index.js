// src/pages/Dashboard/index.js

import React from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import DataManagement from "./DataManagement";
import ForecastGeneration from "./ForecastGeneration";
import Visualizations from "./Visualizations";
import LiveData from "./LiveData";
import "./Dashboard.css";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Revenue Prediction</h2>
          <p>Welcome, {user?.username || "User"}</p>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link to="/dashboard/data">Data Management</Link>
            </li>
            <li>
              <Link to="/dashboard/forecast">Generate Forecast</Link>
            </li>
            <li>
              <Link to="/dashboard/visualizations">Visualizations</Link>
            </li>
            <li>
              <Link to="/dashboard/live-data" className="highlight-link">
                Live Data
              </Link>
            </li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <Routes>
          <Route path="/" element={<DataManagement />} />
          <Route path="/data" element={<DataManagement />} />
          <Route path="/forecast" element={<ForecastGeneration />} />
          <Route path="/visualizations" element={<Visualizations />} />
          <Route path="/live-data" element={<LiveData />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
