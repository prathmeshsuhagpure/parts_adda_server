const User = require("../models/User");
const AppError = require("../utils/appError");
const Wishlist = require("../models/wishlist");
const Vehicle = require("../models/Vehicle");
const asyncHandler = require("../utils/asyncHandler");
const { success, created } = require("../utils/response");

// ── GET /users/profile ────────────────────────────────────────
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) throw new AppError("User not found.", 404);

  const wishlist = await Wishlist.find({ userId: req.user.id }).populate(
    "partId",
    "name price images sku",
  );

  return success(res, {
    user,
    wishlist,
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, avatar, fcmToken, gender, dateOfBirth } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, email, avatar, fcmToken, gender, dateOfBirth },
    { returnDocument: "after", runValidators: true },
  );
  return success(res, { user }, "Profile updated");
});

const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("addresses");
  return success(res, { addresses: user.addresses });
});

const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (req.body.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }
  if (user.addresses.length === 0) req.body.isDefault = true;
  user.addresses.push(req.body);
  await user.save();
  const added = user.addresses[user.addresses.length - 1];
  return created(res, { address: added }, "Address added");
});

const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const addr = user.addresses.id(req.params.id);
  if (!addr) throw new AppError("Address not found.", 404);
  if (req.body.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  Object.assign(addr, req.body);
  await user.save();
  return success(res, { address: addr }, "Address updated");
});

const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const addr = user.addresses.id(req.params.id);
  if (!addr) throw new AppError("Address not found.", 404);
  addr.deleteOne();
  await user.save();
  return success(res, {}, "Address removed");
});

const setDefaultAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  user.addresses.forEach(
    (a) => (a.isDefault = a._id.toString() === req.params.id),
  );
  await user.save();
  return success(res, {}, "Default address updated");
});

const getVehicles = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("vehicles");
  return success(res, { vehicles: user.vehicles });
});

const addVehicle = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  // create vehicle first
  const vehicle = await Vehicle.create(req.body);

  // push vehicle id to user
  user.vehicles.push(vehicle._id);

  await user.save();

  return created(res, { vehicle }, "Vehicle added");
});

const removeVehicle = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const v = user.vehicles.id(req.params.id);
  if (!v) throw new AppError("Vehicle not found.", 404);
  v.deleteOne();
  await user.save();
  return success(res, {}, "Vehicle removed");
});

const applyB2b = asyncHandler(async (req, res) => {
  const { businessName, gstNumber, contactName } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      "b2bProfile.businessName": businessName,
      "b2bProfile.gstNumber": gstNumber,
      "b2bProfile.contactName": contactName,
      "b2bProfile.status": "pending",
    },
    { new: true },
  );
  return success(
    res,
    { b2bProfile: user.b2bProfile },
    "B2B application submitted",
  );
});

module.exports = {
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getVehicles,
  addVehicle,
  removeVehicle,
  applyB2b,
};
