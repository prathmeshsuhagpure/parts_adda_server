const Vehicle = require("../models/Vehicle");
const UserVehicle = require("../models/vehicle catalog models/user_vehicle");

const getMakes = async (req, res) => {
  try {
    const makes = await Vehicle.distinct("make");

    res.status(200).json({
      success: true,
      count: makes.length,
      data: makes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getModels = async (req, res) => {
  try {
    const { make } = req.params;

    const models = await Vehicle.distinct("model", { make });

    res.status(200).json({
      success: true,
      count: models.length,
      data: models,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getYears = async (req, res) => {
  try {
    const { make, model } = req.query;

    if (!make || !model) {
      return res.status(400).json({
        success: false,
        message: "Make and model are required",
      });
    }

    const years = await Vehicle.distinct("year", {
      make,
      model,
    });

    res.status(200).json({
      success: true,
      count: years.length,
      data: years,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getVariants = async (req, res) => {
  try {
    const { make, model, year } = req.query;

    if (!make || !model || !year) {
      return res.status(400).json({
        success: false,
        message: "Make, model and year are required",
      });
    }

    const variants = await Vehicle.find({
      make,
      model,
      year,
    }).select("make model year fuelType engineCC variant variantCode");

    res.status(200).json({
      success: true,
      count: variants.length,
      data: variants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const addUserVehicle = async (req, res) => {
  try {
    const { variantId, registrationNumber } = req.body;

    if (!variantId) {
      return res.status(400).json({
        success: false,
        message: "variantId is required",
      });
    }

    const vehicle = await Vehicle.findById(variantId);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    const userVehicle = await UserVehicle.create({
      user: req.user.id,
      variant: variantId,
      registrationNumber,
    });

    res.status(201).json({
      success: true,
      message: "Vehicle added to garage",
      data: {
        vehicle: userVehicle,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUserVehicles = async (req, res) => {
  try {
    const vehicles = await UserVehicle.find({ user: req.user.id }).populate(
      "variant",
    );

    res.json({
      success: true,
      data: vehicles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const removeVehicle = async (req, res) => {
  const { id } = req.params;

  await UserVehicle.findByIdAndDelete(id);

  res.json({
    success: true,
    message: "Vehicle removed",
  });
};

module.exports = {
  getMakes,
  getModels,
  getYears,
  getVariants,
  getVehicleById,
  addUserVehicle,
  getUserVehicles,
  removeVehicle,
};
