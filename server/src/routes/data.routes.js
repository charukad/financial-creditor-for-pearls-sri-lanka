const express = require("express");
const router = express.Router();
const {
  uploadData,
  getData,
  getDataById,
  updateData,
  deleteData,
  bulkUploadData,
} = require("../controllers/data.controller");
const { protect } = require("../middleware/auth.middleware");

// Protect all routes
router.use(protect);

// @route   POST /api/data
// @desc    Upload historical revenue data
// @access  Private
router.post("/", uploadData);

// @route   GET /api/data
// @desc    Get all data for a company
// @access  Private
router.get("/", getData);

// @route   POST /api/data/bulk
// @desc    Bulk upload data
// @access  Private
router.post("/bulk", bulkUploadData);

// @route   GET /api/data/:id
// @desc    Get single data entry
// @access  Private
router.get("/:id", getDataById);

// @route   PUT /api/data/:id
// @desc    Update data entry
// @access  Private
router.put("/:id", updateData);

// @route   DELETE /api/data/:id
// @desc    Delete data entry
// @access  Private
router.delete("/:id", deleteData);

module.exports = router;
