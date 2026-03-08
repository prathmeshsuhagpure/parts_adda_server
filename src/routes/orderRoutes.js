const router = require("express").Router();
const ctrl = require("../controllers/orderController");
const { protect } = require("..//middlewares/auth");

router.post("/webhook/razorpay", ctrl.razorpayWebhook);
router.use(protect);
router.post("/", ctrl.placeOrder);
router.post("/verify-payment", ctrl.verifyPayment);
router.get("/", ctrl.getOrders);
router.get("/:id", ctrl.getOrderById);
router.post("/:id/cancel", ctrl.cancelOrder);
router.get("/:id/track", ctrl.trackOrder);
module.exports = router;
