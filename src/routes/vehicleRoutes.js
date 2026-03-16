const express = require("express");
const router = express.Router();

const vehicleController = require("../controllers/vehicleController");

router.get("/makes", vehicleController.getMakes);

router.get("/models", vehicleController.getModels);

router.get("/years", vehicleController.getYears);

router.get("/variants", vehicleController.getVariants);

router.get("/vehicle/:id", vehicleController.getVehicleById);

router.post("/user-vehicle", vehicleController.addUserVehicle);

router.get("/user-vehicles", vehicleController.getUserVehicles);

router.delete("/user-vehicle/:id", vehicleController.removeVehicle);

module.exports = router;
