const mongoose = require("mongoose");

const userVehicleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle", // FIXED
      required: true,
    },
    registrationNumber: String,
  },
  { timestamps: true },
);

const UserVehicle = mongoose.model("UserVehicle", userVehicleSchema);

module.exports = UserVehicle;
