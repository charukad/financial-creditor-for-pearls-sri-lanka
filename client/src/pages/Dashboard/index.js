import React, { useState } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import "../../App.css";
import "./css/Dashboard.css";

// Import dashboard components
import DataManagement from "./DataManagement";
import ForecastGeneration from "./ForecastGeneration";
import Visualizations from "./Visualizations";
import Reports from "./Reports";
import Settings from "./Settings";

const Dashboard = () => {
  const { user, logoutUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!user) {
    return <Navigate to="/login" />;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h2>Revenue Prediction</h2>
          <button onClick={toggleSidebar} className="toggle-btn">
            {sidebarOpen ? "←" : "→"}
          </button>
        </div>

        <div className="user-info">
          <p>Welcome, {user ? user.fullName : "User"}</p>
          <p className="company-name">{user ? user.companyName : "Company"}</p>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link to="/dashboard" className="nav-link">
                Dashboard Home
              </Link>
            </li>
            <li>
              <Link to="/dashboard/data" className="nav-link">
                Data Management
              </Link>
            </li>
            <li>
              <Link to="/dashboard/forecast" className="nav-link">
                Generate Forecast
              </Link>
            </li>
            <li>
              <Link to="/dashboard/visualizations" className="nav-link">
                Visualizations
              </Link>
            </li>
            <li>
              <Link to="/dashboard/reports" className="nav-link">
                Reports
              </Link>
            </li>
            <li>
              <Link to="/dashboard/settings" className="nav-link">
                Settings
              </Link>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button onClick={logoutUser} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className={`main-content ${sidebarOpen ? "shifted" : ""}`}>
        <div className="dashboard-header">
          <h1>Revenue Prediction Dashboard</h1>
        </div>

        <div className="dashboard-content">
          <Routes>
            <Route path="/" element={<DashboardHome user={user} />} />
            <Route path="/data" element={<DataManagement />} />
            <Route path="/forecast" element={<ForecastGeneration />} />
            <Route path="/visualizations" element={<Visualizations />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

// Dashboard Home Component
const DashboardHome = ({ user }) => {
  return (
    <div className="dashboard-home">
      <div className="welcome-section">
        <h2>
          Welcome to Revenue Prediction {user ? `, ${user.fullName}` : ""}
        </h2>
        <p>Your intelligent forecasting assistant for the garment industry</p>
      </div>

      <div className="quick-stats">
        <div className="stat-card">
          <h3>Revenue Data</h3>
          <p className="stat-value">0 entries</p>
          <Link to="/dashboard/data" className="card-link">
            Manage Data
          </Link>
        </div>

        <div className="stat-card">
          <h3>Forecasts</h3>
          <p className="stat-value">0 forecasts</p>
          <Link to="/dashboard/forecast" className="card-link">
            Create Forecast
          </Link>
        </div>

        <div className="stat-card">
          <h3>Reports</h3>
          <p className="stat-value">0 reports</p>
          <Link to="/dashboard/reports" className="card-link">
            View Reports
          </Link>
        </div>
      </div>

      <div className="getting-started">
        <h3>Getting Started</h3>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Upload Revenue Data</h4>
              <p>Import your historical revenue data to begin forecasting</p>
              <Link to="/dashboard/data" className="step-link">
                Upload Data
              </Link>
            </div>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Generate Forecast</h4>
              <p>Use machine learning to predict future revenue</p>
              <Link to="/dashboard/forecast" className="step-link">
                Create Forecast
              </Link>
            </div>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Analyze Results</h4>
              <p>Visualize and understand your revenue predictions</p>
              <Link to="/dashboard/visualizations" className="step-link">
                View Visualizations
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
