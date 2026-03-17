require("dotenv").config();
const mongoose = require("mongoose");
const Brand = require("../models/vehicle catalog models/vehicle_brand");
const VehicleModel = require("../models/vehicle catalog models/vehicle_model");
const Generation = require("../models/vehicle catalog models/vehicle_generation");
const Variant = require("../models/vehicle catalog models/vehicle_variant");
const vehicleData = require("../seed/vehicleData");

const seedVehicles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    // Clear collections
    await Brand.deleteMany();
    await VehicleModel.deleteMany();
    await Generation.deleteMany();
    await Variant.deleteMany();

    console.log("Old vehicle data removed");

    for (const brandData of vehicleData) {
      // Create Brand
      const brand = await Brand.create({
        name: brandData.brand,
      });

      for (const modelData of brandData.models) {
        // Create Model
        const model = await VehicleModel.create({
          brand: brand._id,
          name: modelData.name,
        });

        for (const generationData of modelData.generations) {
          // Create Generation
          const generation = await Generation.create({
            model: model._id,
            name: generationData.name,
            startYear: generationData.startYear,
            endYear: generationData.endYear,
          });

          // Prepare variants
          const variants = generationData.variants.map((variant) => ({
            ...variant,
            generation: generation._id,
          }));

          // Insert variants
          await Variant.insertMany(variants);
        }
      }
    }

    console.log("Vehicle database seeded successfully 🚗");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedVehicles();
