// src/components/TestConnection.js
import React, { useState, useEffect } from "react";
import API from "../api";

const TestConnection = () => {
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const testConnection = async () => {
    try {
      setStatus("loading");
      setError(null);

      // Test a simple endpoint
      const response = await API.get("/test");

      setResult(response.data);
      setStatus("success");
    } catch (error) {
      console.error("Connection test failed:", error);
      setError(error);
      setStatus("error");
    }
  };

  // Test MongoDB connection directly
  const testMongoDB = async () => {
    try {
      setStatus("loading");
      setError(null);

      // Call a special endpoint that tests MongoDB connection
      const response = await API.get("/test/mongodb");

      setResult(response.data);
      setStatus("success");
    } catch (error) {
      console.error("MongoDB test failed:", error);
      setError(error);
      setStatus("error");
    }
  };

  return (
    <div className="test-connection">
      <h2>Connection Test</h2>

      <div className="test-actions">
        <button
          onClick={testConnection}
          disabled={status === "loading"}
          className="btn btn-primary"
        >
          Test API Connection
        </button>

        <button
          onClick={testMongoDB}
          disabled={status === "loading"}
          className="btn btn-secondary"
        >
          Test MongoDB Connection
        </button>
      </div>

      {status === "loading" && <p>Testing connection...</p>}

      {status === "success" && (
        <div className="test-result success">
          <h3>Connection Successful!</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {status === "error" && (
        <div className="test-result error">
          <h3>Connection Failed</h3>
          <p>{error?.userMessage || "Could not connect to the server"}</p>

          <div className="error-details">
            <h4>Error Details</h4>
            <p>
              <strong>Status:</strong> {error?.status || "N/A"}
            </p>
            <p>
              <strong>Message:</strong> {error?.message || "No message"}
            </p>
            {error?.data && (
              <div>
                <p>
                  <strong>Server Response:</strong>
                </p>
                <pre>{JSON.stringify(error.data, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestConnection;
