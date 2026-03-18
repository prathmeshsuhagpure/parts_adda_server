const crypto = require("crypto");
const Razorpay = require("razorpay");
const Order = require("../models/Order");
const Transaction = require("../models/Transaction");
const AppError = require("../utils/appError");
const Notification = require("../models/Notification");
const admin = require("firebase-admin");
const asyncHandler = require("../utils/asyncHandler");
const { success, created, paginated } = require("../utils/response");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── POST /orders ──────────────────────────────────────────────
const placeOrder = asyncHandler(async (req, res) => {
  const {
    items,
    shippingAddress,
    paymentMethod,
    couponCode,
    subtotal,
    discount,
    deliveryCharge,
    gst,
    total,
    isB2B,
  } = req.body;

  if (!items || !items.length)
    throw new AppError("Order must have at least one item.", 400);

  const order = await Order.create({
    userId: req.user.id,
    items: items.map((i) => ({ ...i, subtotal: i.price * i.quantity })),
    shippingAddress,
    paymentMethod: paymentMethod || "online",
    couponCode,
    subtotal,
    discount,
    deliveryCharge,
    gst,
    total,
    isB2B: !!isB2B,
    timeline: [{ status: "placed", message: "Order placed successfully" }],
  });

  const title = "Order Placed 🎉";
  const body = `Your order #${order.orderNumber} has been placed successfully. We'll notify you when it's confirmed. Thank you for shopping with us! 😊`;

  await sendNotificationInternal({
    userId: req.user.id,
    type: "order",
    title,
    body,
    fcmToken: req.user.fcmToken,
    email: req.user.email,
    data: { orderId: order._id.toString() },
  });

  // Send FCM push (if token exists in user)
  if (req.user.fcmToken) {
    try {
      await admin.messaging().send({
        token: req.user.fcmToken,
        notification: { title, body },
        data: {
          orderId: order._id.toString(),
          type: "order",
        },
      });
    } catch (err) {
      console.error("FCM error:", err.message);
    }
  }

  // Create Razorpay order for online payment
  if (paymentMethod === "online") {
    const rpOrder = await razorpay.orders.create({
      amount: Math.round(total * 100), // paise
      currency: "INR",
      receipt: order.orderNumber,
      notes: { orderId: order._id.toString() },
    });
    order.razorpayOrderId = rpOrder.id;
    await order.save();
    return created(
      res,
      { order, razorpayOrderId: rpOrder.id, amount: total },
      "Order created. Complete payment.",
    );
  }

  // COD
  await Transaction.create({
    orderId: order._id,
    userId: req.user.id,
    amount: total,
    type: "payment",
    gateway: "cod",
  });
  return created(res, { order }, "Order placed (COD)");
});

// ── POST /orders/verify-payment ───────────────────────────────
const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
    req.body;
  const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
  hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
  const digest = hmac.digest("hex");
  if (digest !== razorpaySignature)
    throw new AppError("Payment verification failed.", 400);

  const order = await Order.findById(orderId);
  if (!order) throw new AppError("Order not found.", 404);
  order.paymentStatus = "paid";
  order.razorpayPaymentId = razorpayPaymentId;
  order.status = "confirmed";
  order.timeline.push({
    status: "confirmed",
    message: "Payment received. Order confirmed.",
  });
  await order.save();
  await Transaction.create({
    orderId: order._id,
    userId: order.userId,
    amount: order.total,
    type: "payment",
    gateway: "razorpay",
    gatewayTxnId: razorpayPaymentId,
    status: "success",
  });
  return success(res, { order }, "Payment verified");
});

// ── GET /orders ───────────────────────────────────────────────
const getOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const filter = { userId: req.user.id };
  if (status) filter.status = status;
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Order.countDocuments(filter),
  ]);
  return paginated(res, orders, total, page, limit);
});

// ── GET /orders/:id ───────────────────────────────────────────
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });
  if (!order) throw new AppError("Order not found.", 404);
  return success(res, { order });
});

// ── POST /orders/:id/cancel ───────────────────────────────────
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });
  if (!order) throw new AppError("Order not found.", 404);
  const cancellable = ["placed", "confirmed", "packed"];
  if (!cancellable.includes(order.status))
    throw new AppError("Order cannot be cancelled at this stage.", 400);
  order.status = "cancelled";
  order.cancelReason = req.body.reason || "Cancelled by customer";
  order.timeline.push({ status: "cancelled", message: order.cancelReason });
  if (order.paymentStatus === "paid") {
    order.paymentStatus = "refunded";
    order.timeline.push({ status: "cancelled", message: "Refund initiated." });
  }
  await order.save();
  return success(res, { order }, "Order cancelled");
});

// ── GET /orders/:id/track ─────────────────────────────────────
const trackOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });
  if (!order) throw new AppError("Order not found.", 404);
  const allSteps = [
    "placed",
    "confirmed",
    "packed",
    "shipped",
    "out_for_delivery",
    "delivered",
  ];
  const currentIdx = allSteps.indexOf(order.status);
  const events = allSteps.map((step, i) => ({
    title: step.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    isDone: i < currentIdx,
    isActive: i === currentIdx,
    timestamp: order.timeline.find((t) => t.status === step)?.timestamp,
  }));
  return success(res, {
    order,
    tracking: {
      events,
      awbNumber: order.awbNumber,
      courierName: order.courierName,
      estimatedDelivery: null, // populated from shiprocket webhook
    },
  });
});

// ── POST /orders/webhook/razorpay ─────────────────────────────
const razorpayWebhook = asyncHandler(async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];
  const body = JSON.stringify(req.body);
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(body);
  if (hmac.digest("hex") !== signature)
    return res.status(400).json({ message: "Invalid signature" });

  const { event, payload } = req.body;
  if (event === "payment.captured") {
    const payment = payload.payment.entity;
    const orderId = payment.notes?.orderId;
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: "paid",
        razorpayPaymentId: payment.id,
        status: "confirmed",
        $push: {
          timeline: {
            status: "confirmed",
            message: "Payment captured via webhook.",
          },
        },
      });
    }
  }
  res.json({ received: true });
});

module.exports = {
  placeOrder,
  verifyPayment,
  getOrders,
  getOrderById,
  cancelOrder,
  trackOrder,
  razorpayWebhook,
};
