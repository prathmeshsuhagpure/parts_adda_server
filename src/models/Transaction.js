const mongoose = require("mongoose");
const txSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["payment", "refund", "adjustment"] },
    gateway: { type: String, enum: ["razorpay", "cod", "credit", "wallet"] },
    gatewayTxnId: String,
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
);

const Transaction = mongoose.model("Transaction", txSchema);
module.exports = Transaction;
