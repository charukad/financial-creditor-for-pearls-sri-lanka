// src/pages/Debug.js
import React from "react";
import { Link } from "react-router-dom";
import TestConnection from "../components/TestConnection";

const Debug = () => {
  return (
    <div className="debug-page">
      <div className="debug-container">
        <h1>Debug Tools</h1>
        <p>Use these tools to test and debug your application</p>

        <TestConnection />

        <div className="debug-navigation">
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Debug;
