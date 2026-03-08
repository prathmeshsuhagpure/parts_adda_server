const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    partId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Part",
      required: true,
    },
    sellerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    partName: { type: String, required: true },
    partSku: String,
    partImage: String,
    sellerName: String,
    price: { type: Number, required: true },
    mrp: Number,
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: true, timestamps: true },
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    couponCode: String,
    discount: { type: Number, default: 0 },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true },
);

cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

cartSchema.virtual("subtotal").get(function () {
  return this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
});

cartSchema.virtual("deliveryCharge").get(function () {
  const subtotal = this.subtotal;
  return subtotal >= 500 ? 0 : 49;
});

cartSchema.virtual("gst").get(function () {
  return Math.round((this.subtotal - this.discount) * 0.18 * 100) / 100;
});

cartSchema.virtual("total").get(function () {
  return this.subtotal - this.discount + this.deliveryCharge + this.gst;
});

cartSchema.set("toJSON", { virtuals: true });
cartSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Cart", cartSchema);
