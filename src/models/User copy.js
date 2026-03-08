// Re-use same schema — in prod this would be a shared package
// Here we re-declare to keep services independent
const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Home" },
    fullName: { type: String, required: true },
    phone: String,
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

const vehicleSchema = new mongoose.Schema(
  {
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    fuelType: String,
    variant: String,
    registrationNumber: String,
  },
  { _id: true },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, sparse: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["customer", "dealer", "vendor", "admin"],
      default: "customer",
    },
    avatar: String,
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    fcmToken: String,
    addresses: [addressSchema],
    vehicles: [vehicleSchema],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Part" }],
    b2bProfile: {
      businessName: String,
      gstNumber: String,
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      creditLimit: { type: Number, default: 0 },
      creditUsed: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
