const User = require("../models/User");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const { success, created } = require("../utils/response");

// ── GET /users/profile ────────────────────────────────────────
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate(
    "wishlist",
    "name price images sku",
  );
  if (!user) throw new AppError("User not found.", 404);
  return success(res, { user });
});

// ── PUT /users/profile ────────────────────────────────────────
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, email, avatar, fcmToken } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, email, avatar, fcmToken },
    { new: true, runValidators: true },
  );
  return success(res, { user }, "Profile updated");
});

// ── GET /users/addresses ──────────────────────────────────────
exports.getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("addresses");
  return success(res, { addresses: user.addresses });
});

// ── POST /users/addresses ─────────────────────────────────────
exports.addAddress = asyncHandler(async (req, res) => {
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

// ── PUT /users/addresses/:id ──────────────────────────────────
exports.updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const addr = user.addresses.id(req.params.id);
  if (!addr) throw new AppError("Address not found.", 404);
  if (req.body.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  Object.assign(addr, req.body);
  await user.save();
  return success(res, { address: addr }, "Address updated");
});

// ── DELETE /users/addresses/:id ───────────────────────────────
exports.deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const addr = user.addresses.id(req.params.id);
  if (!addr) throw new AppError("Address not found.", 404);
  addr.deleteOne();
  await user.save();
  return success(res, {}, "Address removed");
});

// ── POST /users/addresses/:id/default ────────────────────────
exports.setDefaultAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  user.addresses.forEach(
    (a) => (a.isDefault = a._id.toString() === req.params.id),
  );
  await user.save();
  return success(res, {}, "Default address updated");
});

// ── GET /users/vehicles ───────────────────────────────────────
exports.getVehicles = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("vehicles");
  return success(res, { vehicles: user.vehicles });
});

// ── POST /users/vehicles ──────────────────────────────────────
exports.addVehicle = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  user.vehicles.push(req.body);
  await user.save();
  return created(
    res,
    { vehicle: user.vehicles[user.vehicles.length - 1] },
    "Vehicle added",
  );
});

// ── DELETE /users/vehicles/:id ────────────────────────────────
exports.removeVehicle = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const v = user.vehicles.id(req.params.id);
  if (!v) throw new AppError("Vehicle not found.", 404);
  v.deleteOne();
  await user.save();
  return success(res, {}, "Vehicle removed");
});

// ── POST /users/b2b/apply ─────────────────────────────────────
exports.applyB2b = asyncHandler(async (req, res) => {
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
