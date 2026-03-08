const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    partId: { type: mongoose.Schema.Types.ObjectId, required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    partName: String,
    partSku: String,
    partImage: String,
    price: { type: Number, required: true },
    mrp: Number,
    quantity: { type: Number, required: true, min: 1 },
    subtotal: Number,
  },
  { _id: true },
);

const timelineSchema = new mongoose.Schema(
  {
    status: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
    updatedBy: String,
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    items: [orderItemSchema],
    status: {
      type: String,
      enum: [
        "placed",
        "confirmed",
        "packed",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "placed",
    },
    shippingAddress: {
      fullName: String,
      phone: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
    },
    subtotal: Number,
    discount: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    gst: Number,
    total: { type: Number, required: true },
    couponCode: String,
    paymentMethod: {
      type: String,
      enum: ["online", "cod", "credit"],
      default: "online",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    invoiceUrl: String,
    awbNumber: String, // courier tracking number
    courierName: String,
    timeline: [timelineSchema],
    cancelReason: String,
    returnReason: String,
    isB2B: { type: Boolean, default: false },
  },
  { timestamps: true },
);

orderSchema.pre("save", function (next) {
  if (!this.orderNumber) {
    this.orderNumber =
      "AP" +
      Date.now().toString(36).toUpperCase() +
      Math.random().toString(36).slice(2, 5).toUpperCase();
  }
  next();
});

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model("Order", orderSchema);
