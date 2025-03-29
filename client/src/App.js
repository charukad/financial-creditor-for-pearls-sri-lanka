import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";

// Import pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateEvent from "./pages/CreateEvent"; // Import your CreateEvent component
import NotFound from "./pages/NotFound";

// Auth context
import { AuthProvider } from "./context/AuthContext";

// Import Debug component
import Debug from "./pages/Debug";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* Default landing page */}
            <Route path="/" element={<Landing />} />

            {/* Authentication routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Dashboard and nested routes */}
            <Route path="/dashboard/*" element={<Dashboard />} />

            {/* Create event route */}
            <Route path="/create-event" element={<CreateEvent />} />

            {/* Redirect for incorrect URLs */}
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/debug" element={<Debug />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
