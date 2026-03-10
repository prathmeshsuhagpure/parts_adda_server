const Dealer = require("../models/Dealer");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { success, created, error } = require("../utils/response");

const applyDealer = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    password,
    shopName,
    gstNumber,
    panNumber,
    address,
    city,
    state,
    pincode,
  } = req.body;

  const existingDealer = await Dealer.findOne({
    $or: [{ phone }, { email }],
  });

  if (existingDealer) {
    return error(
      res,
      "Dealer with this phone number or email already exists.",
      409,
    );
  }

  // Create User
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: "dealer",
  });

  const dealer = new Dealer({
    userId: user._id,
    shopName,
    ownerName: name,
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

const getDealerStatus = asyncHandler(async (req, res) => {
  const dealer = await Dealer.findOne({ user: req.user.id });

  if (!dealer) {
    return error(res, "Dealer application not found", 404);
  }

  return success(res, {
    status: dealer.verificationStatus,
    dealer,
  });
});

module.exports = {
  applyDealer,
  getDealerStatus,
};
