const mongoose = require("mongoose");
const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    type: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true },
    minOrder: { type: Number, default: 0 },
    maxDiscount: Number,
    usageLimit: { type: Number, default: 100 },
    usedCount: { type: Number, default: 0 },
    validFrom: Date,
    validUntil: Date,
    isActive: { type: Boolean, default: true },
    forRoles: [String], // [] = all roles
  },
  { timestamps: true },
);
module.exports = mongoose.model("Coupon", couponSchema);
