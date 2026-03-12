const express = require("express");
const router = express.Router();

const vehicleController = require("../controllers/vehicleController");

router.get("/brands", vehicleController.getBrands);

router.get("/models", vehicleController.getModels);

router.get("/variants", vehicleController.getVariants);

router.post("/user-vehicle", vehicleController.addUserVehicle);

router.get("/user-vehicles", vehicleController.getUserVehicles);

router.delete("/user-vehicle/:id", vehicleController.removeVehicle);

module.exports = router;
