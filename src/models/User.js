const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Home" },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, sparse: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, select: false },
    role: {
      type: String,
      enum: ["customer", "dealer", "vendor", "admin"],
      default: "customer",
    },
    avatar: String,
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    dateOfBirth: Date,
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    fcmToken: String,
    addresses: [addressSchema],
    vehicles: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Vehicle",
        },
      ],
      default: [],
    },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true },
);

userSchema.index({ role: 1 });

userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.password;
    delete ret.refreshToken;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
