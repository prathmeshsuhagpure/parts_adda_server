const Dealer = require("../models/dealer");
const asyncHandler = require("../utils/asyncHandler");
const { success, created, error } = require("../utils/response");

const applyDealer = asyncHandler(async (req, res) => {
  const {
    shopName,
    ownerName,
    gstNumber,
    panNumber,
    email,
    phone,
    address,
    city,
    state,
    pincode,
  } = req.body;

  const userId = req.user?.id || req.body.userId;

  if (!userId) {
    return error(res, "User ID is required", 400);
  }

  const existingDealer = await Dealer.findOne({ userId });
  if (existingDealer) {
    return error(res, "Dealer with this user ID already exists.", 409);
  }

  const dealer = new Dealer({
    userId,
    shopName,
    ownerName,
    gstNumber,
    panNumber,
    email,
    phone,
    address,
    city,
    state,
    pincode,
    verificationStatus: "pending",
  });

  await dealer.save();

  return created(res, { dealer }, "Dealer application submitted successfully");
});

module.exports = {
  applyDealer,
};
