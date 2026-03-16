const Brand = require("../models/Brand");
const VehicleModel = require("../models/vehicle catalog models/vehicle_model");
const Generation = require("../models/vehicle catalog models/vehicle_generation");
const Variant = require("../models/vehicle catalog models/vehicle_variant");
const UserVehicle = require("../models/vehicle catalog models/user_vehicle");

// GET ALL BRANDS
const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find().select("name");

    res.status(200).json({
      success: true,
      count: brands.length,
      data: brands,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET MODELS BY BRAND
const getModels = async (req, res) => {
  try {
    const { brandId } = req.params;

    const models = await VehicleModel.find({ brand: brandId }).select("name");

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

// GET GENERATIONS BY MODEL
const getGenerations = async (req, res) => {
  try {
    const { modelId } = req.params;

    const generations = await Generation.find({ model: modelId });

    res.status(200).json({
      success: true,
      count: generations.length,
      data: generations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET VARIANTS BY GENERATION
const getVariants = async (req, res) => {
  try {
    const { generationId } = req.params;

    const variants = await Variant.find({ generation: generationId });

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

// GET VARIANT BY ID
const getVariantById = async (req, res) => {
  try {
    const variant = await Variant.findById(req.params.id).populate({
      path: "generation",
      populate: {
        path: "model",
        populate: {
          path: "brand",
        },
      },
    });

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
      });
    }

    res.status(200).json({
      success: true,
      data: variant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ADD VEHICLE TO USER GARAGE
const addUserVehicle = async (req, res) => {
  try {
    const { variantId, registrationNumber } = req.body;

    if (!variantId) {
      return res.status(400).json({
        success: false,
        message: "variantId is required",
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

// GET USER GARAGE VEHICLES
const getUserVehicles = async (req, res) => {
  try {
    const vehicles = await UserVehicle.find({ user: req.user.id }).populate({
      path: "variant",
      populate: {
        path: "generation",
        populate: {
          path: "model",
          populate: {
            path: "brand",
          },
        },
      },
    });

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

// REMOVE VEHICLE FROM GARAGE
const removeVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    await UserVehicle.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Vehicle removed",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getBrands,
  getModels,
  getGenerations,
  getVariants,
  getVariantById,
  addUserVehicle,
  getUserVehicles,
  removeVehicle,
};
