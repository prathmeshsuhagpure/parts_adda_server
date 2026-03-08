const router = require("express").Router();
const ctrl = require("../controllers/cartController");
const { protect } = require("../middlewares/auth");

router.use(protect);
router.get("/", ctrl.getCart);
router.post("/items", ctrl.addItem);
router.put("/items/:itemId", ctrl.updateItem);
router.delete("/items/:itemId", ctrl.removeItem);
router.post("/coupon", ctrl.applyCoupon);
router.delete("/coupon", ctrl.removeCoupon);
router.delete("/", ctrl.clearCart);
module.exports = router;
