import API from "./index";

// Generate a new forecast
export const generateForecast = async (forecastData) => {
  try {
    const response = await API.post("/forecasts", forecastData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Get all forecasts for the company
export const getForecasts = async () => {
  try {
    const response = await API.get("/forecasts");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Get forecast by ID
export const getForecastById = async (id) => {
  try {
    const response = await API.get(`/forecasts/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Delete a forecast
export const deleteForecast = async (id) => {
  try {
    const response = await API.delete(`/forecasts/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};
