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

  const existingDealer = await Dealer.findOne({ phone });
  if (existingDealer) {
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
    verificationStatus: "pending",
  });

  await dealer.save();

  return created(res, { dealer }, "Dealer application submitted successfully");
});

module.exports = {
  applyDealer,
};
