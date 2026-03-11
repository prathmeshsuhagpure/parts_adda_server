const mongoose = require("mongoose");
const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    logo: String,
    country: String,
    isOEM: { type: Boolean, default: false },
    partnerStatus: {
      type: String,
      enum: ["none", "authorized", "premium"],
      default: "none",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Brand = mongoose.model("Brand", brandSchema);
module.exports = Brand;
