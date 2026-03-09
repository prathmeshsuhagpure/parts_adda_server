const Wishlist = require("../models/wishlist");
const asyncHandler = require("../utils/asyncHandler");
const { success, created } = require("../utils/response");

const toggleWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const partId = req.params.partId;

  const existing = await Wishlist.findOne({ userId, partId });

  if (existing) {
    await existing.deleteOne();

    return success(res, { action: "removed" }, "Removed from wishlist");
  }

  await Wishlist.create({ userId, partId });

  return success(res, { action: "added" }, "Added to wishlist");
});

const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.find({ userId: req.user.id })
    .populate("partId", "name price images sku brandId stock")
    .sort("-createdAt");

  const parts = wishlist.map((w) => w.partId);

  return success(res, { wishlist: parts });
});

module.exports = { toggleWishlist, getWishlist };
