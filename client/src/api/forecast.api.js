// client/src/api/forecast.api.js
import API from "./index";

// Generate a new forecast
export const generateForecast = async (forecastData) => {
  try {
    console.log("🔮 Generating forecast with parameters:", forecastData);
    const response = await API.post("/forecasts", forecastData);
    console.log("✅ Forecast generated successfully");
    return response.data;
  } catch (error) {
    console.error("❌ Forecast generation failed:", error);

    // Create a user-friendly error message
    let errorMessage = "Failed to generate forecast";

    if (error.data?.error) {
      errorMessage = error.data.error;
    } else if (error.status === 400) {
      errorMessage = "Invalid forecast parameters. Please check your inputs.";
    } else if (error.status === 500) {
      errorMessage = "Server error. Please try again later.";
    } else if (!error.status) {
      errorMessage = "Network error. Please check your connection.";
    }

    throw { ...error, userMessage: errorMessage };
  }
};

// Get all forecasts for the company
export const getForecasts = async () => {
  try {
    const response = await API.get("/forecasts");
    return response.data;
  } catch (error) {
    console.error("Failed to get forecasts:", error);
    throw error;
  }
};

// Get forecast by ID
export const getForecastById = async (id) => {
  try {
    const response = await API.get(`/forecasts/${id}`);
    return response.data;
  } catch (error) {
    console.error("Failed to get forecast details:", error);
    throw error;
  }
};

// Delete a forecast
export const deleteForecast = async (id) => {
  try {
    const response = await API.delete(`/forecasts/${id}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete forecast:", error);
    throw error;
  }
};
