const express = require("express");
const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get("/profile", (req, res) => {
  res.status(200).json({ message: "Get profile endpoint" });
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", (req, res) => {
  res.status(200).json({ message: "Update profile endpoint" });
});

module.exports = router;
