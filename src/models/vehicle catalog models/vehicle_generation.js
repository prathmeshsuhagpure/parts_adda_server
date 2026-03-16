const mongoose = require("mongoose");

const generationSchema = new mongoose.Schema({
  model: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VehicleModel",
    required: true,
  },
  name: String,
  startYear: Number,
  endYear: Number,
});

const VehicleGeneration = mongoose.model("VehicleGeneration", generationSchema);
module.exports = VehicleGeneration;
