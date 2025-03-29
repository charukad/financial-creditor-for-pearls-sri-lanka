import API from "./index";

// Upload revenue data
export const uploadRevenueData = async (data) => {
  try {
    const response = await API.post("/data", data);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Get all revenue data for the company
export const getRevenueData = async () => {
  try {
    const response = await API.get("/data");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Get single data entry by ID
export const getRevenueDataById = async (id) => {
  try {
    const response = await API.get(`/data/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Update revenue data
export const updateRevenueData = async (id, data) => {
  try {
    const response = await API.put(`/data/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Delete revenue data
export const deleteRevenueData = async (id) => {
  try {
    const response = await API.delete(`/data/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Bulk upload revenue data
export const bulkUploadRevenueData = async (dataEntries) => {
  try {
    const response = await API.post("/data/bulk", { dataEntries });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};
