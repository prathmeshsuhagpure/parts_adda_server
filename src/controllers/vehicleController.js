const VehicleBrand = require("../models/vehicle catalog models/vehicle_brand");
const VehicleModel = require("../models/vehicle catalog models/vehicle_model");
const VehicleVariant = require("../models/vehicle catalog models/vehicle_variant");
const UserVehicle = require("../models/vehicle catalog models/user_vehicle");

const getBrands = async (req, res) => {
  const brands = await VehicleBrand.find();
  res.json({ success: true, data: brands });
};

const getModels = async (req, res) => {
  const { brandId } = req.query;

  const models = await VehicleModel.find({ brand: brandId });

  res.json({ success: true, data: models });
};

const getVariants = async (req, res) => {
  const { modelId } = req.query;

  const variants = await VehicleVariant.find({ model: modelId });

  res.json({ success: true, data: variants });
};

const addUserVehicle = async (req, res) => {
  const { variantId, registrationNumber } = req.body;

  const vehicle = await UserVehicle.create({
    user: req.user.id,
    variant: variantId,
    registrationNumber,
  });

  res.json({
    success: true,
    message: "Vehicle added",
    data: vehicle,
  });
};

const getUserVehicles = async (req, res) => {
  const vehicles = await UserVehicle.find({ user: req.user.id }).populate({
    path: "variant",
    populate: {
      path: "model",
      populate: {
        path: "brand",
      },
    },
  });

  res.json({
    success: true,
    data: vehicles,
  });
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
  getBrands,
  getModels,
  getVariants,
  addUserVehicle,
  getUserVehicles,
  removeVehicle,
};
