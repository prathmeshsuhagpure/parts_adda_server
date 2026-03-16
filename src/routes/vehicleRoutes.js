const express = require("express");
const router = express.Router();

const vehicleController = require("../controllers/vehicleController");

router.get("/makes", vehicleController.getMakes);

router.get("/models/:make", vehicleController.getModels);

router.get("/years", vehicleController.getYears);

router.get("/variants", vehicleController.getVariants);

router.get("/:id", vehicleController.getVehicleById);

router.post("/garage/addVehicle", vehicleController.addUserVehicle);

router.get("/garage/getVehicles", vehicleController.getUserVehicles);

router.delete("/garage/removeVehicle/:id", vehicleController.removeVehicle);

module.exports = router;
