const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Company name is required"],
    trim: true,
  },
  industry: {
    type: String,
    enum: [
      "apparel manufacturing",
      "textile production",
      "garment export",
      "other",
    ],
    default: "apparel manufacturing",
  },
  size: {
    type: String,
    enum: ["small", "medium", "large"],
    default: "small",
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: {
      type: String,
      default: "Sri Lanka",
    },
  },
  phone: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Company", CompanySchema);
