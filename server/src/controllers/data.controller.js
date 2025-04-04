// server/src/controllers/data.controller.js

const Data = require("../models/data.model");
const logger = require("../utils/logger");

// Get all revenue data
exports.getRevenueData = async (req, res) => {
  try {
    const { companyId } = req.query;

    // Build query - filter by company ID if provided
    const query = companyId ? { company: companyId } : {};

    // Verify Data is a valid model before using it
    if (!Data || typeof Data.find !== "function") {
      logger.error("Data model is not properly defined or imported");
      return res.status(500).json({
        success: false,
        error: "Database model not properly initialized",
      });
    }

    // Get data from database
    const data = await Data.find(query).sort({ date: -1 });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error(`Error fetching revenue data: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Other controller methods...

// @desc    Upload historical revenue data
// @route   POST /api/data
// @access  Private
exports.uploadData = async (req, res, next) => {
  try {
    // Add user and company information to the request body
    req.body.uploadedBy = req.user.id;
    req.body.company = req.user.company;

    // Create the data entry
    const data = await Data.create(req.body);

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all data for a company
// @route   GET /api/data
// @access  Private
exports.getData = async (req, res, next) => {
  try {
    // Find all data entries for the user's company
    const data = await Data.find({ company: req.user.company }).sort({
      date: -1,
    });

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single data entry
// @route   GET /api/data/:id
// @access  Private
exports.getDataById = async (req, res, next) => {
  try {
    // Find data entry by ID
    const data = await Data.findById(req.params.id);

    // Check if data exists
    if (!data) {
      return res.status(404).json({
        success: false,
        error: "Data not found",
      });
    }

    // Check if user belongs to the company that owns the data
    if (data.company.toString() !== req.user.company.toString()) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to access this data",
      });
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update data entry
// @route   PUT /api/data/:id
// @access  Private
exports.updateData = async (req, res, next) => {
  try {
    // Find data entry by ID
    let data = await Data.findById(req.params.id);

    // Check if data exists
    if (!data) {
      return res.status(404).json({
        success: false,
        error: "Data not found",
      });
    }

    // Check if user belongs to the company that owns the data
    if (data.company.toString() !== req.user.company.toString()) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this data",
      });
    }

    // Update data
    data = await Data.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete data entry
// @route   DELETE /api/data/:id
// @access  Private
exports.deleteData = async (req, res, next) => {
  try {
    // Find data entry by ID
    const data = await Data.findById(req.params.id);

    // Check if data exists
    if (!data) {
      return res.status(404).json({
        success: false,
        error: "Data not found",
      });
    }

    // Check if user belongs to the company that owns the data
    if (data.company.toString() !== req.user.company.toString()) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this data",
      });
    }

    // Delete data
    await data.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk upload data
// @route   POST /api/data/bulk
// @access  Private
exports.bulkUploadData = async (req, res, next) => {
  try {
    const { dataEntries } = req.body;

    // Validate input
    if (
      !dataEntries ||
      !Array.isArray(dataEntries) ||
      dataEntries.length === 0
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid data format for bulk upload",
      });
    }

    // Add user and company information to each entry
    const enrichedEntries = dataEntries.map((entry) => ({
      ...entry,
      uploadedBy: req.user.id,
      company: req.user.company,
    }));

    // Create multiple data entries
    const data = await Data.insertMany(enrichedEntries);

    res.status(201).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};
