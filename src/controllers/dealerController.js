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
    verificationStatus,
  } = req.body;

  const existing = await Dealer.findOne({ phone });
  if (existing) {
    return error(res, "Dealer with this phone number already exists.", 409);
  }

  const dealer = new Dealer({
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
    verificationStatus: verificationStatus || "pending",
  });

  await dealer.save();

  return created(res, { dealer }, "Dealer application submitted successfully");
});

module.exports = {
  applyDealer,
};
