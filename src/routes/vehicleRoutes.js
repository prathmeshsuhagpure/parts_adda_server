const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");

const {
  getBrands,
  getModels,
  getGenerations,
  getVariants,
  getVariantById,
  addUserVehicle,
  getUserVehicles,
  removeVehicle,
} = require("../controllers/vehicleController");

router.get("/brands", getBrands);

router.get("/models/:brandId", getModels);

router.get("/generations/:modelId", getGenerations);

router.get("/variants/:generationId", getVariants);

router.get("/variant/:id", getVariantById);

router.post("/garage/addVehicle", protect, addUserVehicle);

router.get("/garage/getVehicles", protect, getUserVehicles);

router.delete("/garage/removeVehicle/:id", protect, removeVehicle);

module.exports = router;
