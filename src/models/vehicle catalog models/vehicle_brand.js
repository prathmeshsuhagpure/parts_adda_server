const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  logo: String,
  color: String,
});

const VehicleBrand = mongoose.model("VehicleBrand", brandSchema);
module.exports = VehicleBrand;
