const mongoose = require("mongoose");
const reviewSchema = new mongoose.Schema(
  {
    partId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Part",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: String,
    comment: String,
    images: [String],
    verified: { type: Boolean, default: false }, // linked to actual purchase
    helpful: { type: Number, default: 0 },
  },
  { timestamps: true },
);
reviewSchema.index({ partId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ partId: 1, userId: 1 }, { unique: true });
module.exports = mongoose.model("Review", reviewSchema);
