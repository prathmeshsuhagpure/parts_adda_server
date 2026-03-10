const express = require("express");
const router = express.Router();
const dealerController = require("../controllers/dealerController");

router.post("/apply", dealerController.applyDealer);
router.get("/status", dealerController.getDealerStatus);

module.exports = router;
