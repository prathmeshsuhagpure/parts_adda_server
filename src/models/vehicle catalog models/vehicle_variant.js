const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  model: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VehicleModel",
    required: true,
  },
  name: String,
  year: Number,
  fuelType: {
    type: String,
    enum: ["petrol", "diesel", "electric", "cng", "hybrid"],
  },
  engineCC: Number,
});

const VehicleVariant = mongoose.model("VehicleVariant", variantSchema);
module.exports = VehicleVariant;
