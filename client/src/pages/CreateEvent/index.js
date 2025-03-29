// src/pages/CreateEvent/index.js
import React from "react";
import { Link } from "react-router-dom";
import "./createevent.css";

const CreateEvent = () => {
  return (
    <div className="create-event-container">
      <h1>Create Event</h1>
      <p>This page allows you to create a new event.</p>
      <div className="actions">
        <Link to="/" className="btn btn-primary">
          Go to Home Page
        </Link>
      </div>
    </div>
  );
};

export default CreateEvent;
