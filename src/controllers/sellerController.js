const Vendor = require("../models/Vendor");
const AppError = require("..//utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const { success, created, paginated } = require("../utils/response");

exports.register = asyncHandler(async (req, res) => {
  const existing = await Vendor.findOne({ userId: req.user.id });
  if (existing) throw new AppError("Vendor already registered.", 409);
  const vendor = await Vendor.create({ userId: req.user.id, ...req.body });
  return created(
    res,
    { vendor },
    "Vendor application submitted. Pending review.",
  );
});

exports.getDashboard = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor) throw new AppError("Vendor account not found.", 404);
  if (vendor.status !== "approved")
    throw new AppError("Vendor account is not approved yet.", 403);

  // In prod: aggregate from orders, parts collections
  const stats = {
    totalRevenue: vendor.totalSales,
    pendingPayout: vendor.pendingPayout,
    ordersToday: 0,
    totalOrders: 0,
    activeListings: 0,
    lowStockCount: 0,
    rating: vendor.rating,
  };
  return success(res, { vendor, stats });
});

exports.getProfile = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor) throw new AppError("Vendor not found.", 404);
  return success(res, { vendor });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOneAndUpdate(
    { userId: req.user.id },
    { $set: req.body },
    { new: true, runValidators: true },
  );
  if (!vendor) throw new AppError("Vendor not found.", 404);
  return success(res, { vendor }, "Profile updated");
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  // In prod: call order service internally
  const { status, awbNumber, courierName } = req.body;
  const validStatuses = ["confirmed", "packed", "shipped"];
  if (!validStatuses.includes(status))
    throw new AppError("Invalid status transition.", 400);

  // TODO: call order service to update
  return success(res, {}, `Order status updated to ${status}`);
});

exports.getPayouts = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor) throw new AppError("Vendor not found.", 404);
  // In prod: fetch from transactions collection
  return success(res, { pendingPayout: vendor.pendingPayout, payouts: [] });
});
