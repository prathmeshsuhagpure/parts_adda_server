const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    partId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Part",
      required: true,
      index: true,
    },

    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

wishlistSchema.index({ userId: 1, partId: 1 }, { unique: true });

const Wishlist = mongoose.model("Wishlist", wishlistSchema);
module.exports = Wishlist;
