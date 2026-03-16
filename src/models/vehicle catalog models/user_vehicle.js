const mongoose = require("mongoose");

const userVehicleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  variant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Variant",
  },

  registrationNumber: String,
});

const UserVehicle = mongoose.model("UserVehicle", userVehicleSchema);
module.exports = UserVehicle;
