const mongoose = require("mongoose");
const notifSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  type: {
    type: String,
    enum: ["order", "promo", "system", "review", "payout"],
    required: true,
  },
  title: { type: String, required: true },
  body: { type: String, required: true },
  data: mongoose.Schema.Types.Mixed,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 7776000 }, // 90 days TTL
});
notifSchema.index({ userId: 1, createdAt: -1 });
module.exports = mongoose.model("Notification", notifSchema);
