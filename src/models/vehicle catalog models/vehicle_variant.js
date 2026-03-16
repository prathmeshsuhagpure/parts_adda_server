const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  generation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VehicleGeneration",
    required: true,
  },

  engineCC: Number,

  fuelType: {
    type: String,
    enum: [
      "Petrol",
      "Diesel",
      "Petrol Hybrid",
      "Electric",
      "CNG",
      "Petrol Turbo",
    ],
  },

  transmission: {
    type: String,
    enum: ["Manual", "Automatic", "CVT", "DCT", "AMT"],
  },

  trimLevel: {
    type: String,
    enum: ["Base", "Mid", "Top"],
  },

  variantName: String,

  emissionStandard: {
    type: String,
    enum: ["BS4", "BS6", "BS6 Phase 2"],
  },
});

const VehicleVariant = mongoose.model("VehicleVariant", variantSchema);
module.exports = VehicleVariant;
