const express = require("express");
const router = express.Router();
const dealerController = require("../controllers/dealerController");
const { protect } = require("../middlewares/auth");

router.post("/apply", dealerController.applyDealer);
router.get("/status", protect, dealerController.getDealerStatus);
router.put("/status/:dealerId", protect, dealerController.updateDealerStatus);

module.exports = router;
