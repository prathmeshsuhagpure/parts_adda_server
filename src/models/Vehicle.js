const mongoose = require("mongoose");
const vehicleSchema = new mongoose.Schema(
  {
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    fuelType: {
      type: String,
      enum: ["petrol", "diesel", "electric", "hybrid", "cng"],
    },
    engineCC: Number,
    variant: String,
    variantCode: String,
  },
  { timestamps: true },
);
vehicleSchema.index({ make: 1, model: 1, year: 1 });
module.exports = mongoose.model("Vehicle", vehicleSchema);
