require("dotenv").config();
const mongoose = require("mongoose");
const Vehicle = require("../models/Vehicle");

const vehicleData = require("../seed/vehicleData");

const seedVehicles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    await Vehicle.deleteMany();

    console.log("Old vehicles removed");

    await Vehicle.insertMany(vehicleData);

    console.log("Vehicles inserted:", vehicleData.length);

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedVehicles();
