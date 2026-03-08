const mongoose = require("mongoose");
const vendorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
    },
    businessName: { type: String, required: true },
    gstNumber: { type: String, required: true },
    panNumber: String,
    contactName: { type: String, required: true },
    contactPhone: String,
    contactEmail: String,
    address: { line1: String, city: String, state: String, pincode: String },
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      accountHolder: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "suspended"],
      default: "pending",
    },
    rating: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    pendingPayout: { type: Number, default: 0 },
    commissionRate: { type: Number, default: 10 }, // %
  },
  { timestamps: true },
);
module.exports = mongoose.model("Vendor", vendorSchema);
