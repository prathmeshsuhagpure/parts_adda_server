const router = require("express").Router();
const ctrl = require("../controllers/userController");
const { protect } = require("../middlewares/auth");

router.use(protect);
router.get("/profile", ctrl.getProfile);
router.put("/profile", ctrl.updateProfile);
router.get("/addresses", ctrl.getAddresses);
router.post("/addresses", ctrl.addAddress);
router.put("/addresses/:id", ctrl.updateAddress);
router.delete("/addresses/:id", ctrl.deleteAddress);
router.post("/addresses/:id/default", ctrl.setDefaultAddress);
router.get("/vehicles", ctrl.getVehicles);
router.post("/vehicles", ctrl.addVehicle);
router.delete("/vehicles/:id", ctrl.removeVehicle);
router.get("/wishlist", ctrl.getWishlist);
router.post("/wishlist/:partId", ctrl.toggleWishlist);
router.post("/b2b/apply", ctrl.applyB2b);
module.exports = router;
