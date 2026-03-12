const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema({
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VehicleBrand",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

const VehicleModel = mongoose.model("VehicleModel", modelSchema);
module.exports = VehicleModel;
