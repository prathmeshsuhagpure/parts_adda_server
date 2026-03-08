const Cart = require("../models/Cart");
const Coupon = require("../models/Coupon");
const AppError = require("..//utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/response");

const getOrCreate = async (userId) => {
  let cart = await Cart.findOne({ userId });
  if (!cart) cart = await Cart.create({ userId, items: [] });
  return cart;
};

exports.getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreate(req.user.id);
  return success(res, { cart });
});

exports.addItem = asyncHandler(async (req, res) => {
  const {
    partId,
    sellerId,
    partName,
    partSku,
    partImage,
    sellerName,
    price,
    mrp,
    quantity = 1,
  } = req.body;
  const cart = await getOrCreate(req.user.id);

  const existing = cart.items.find(
    (i) => i.partId.toString() === partId && i.sellerId.toString() === sellerId,
  );
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({
      partId,
      sellerId,
      partName,
      partSku,
      partImage,
      sellerName,
      price,
      mrp,
      quantity,
    });
  }
  await cart.save();
  return success(res, { cart }, "Item added to cart");
});

exports.updateItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) throw new AppError("Cart not found.", 404);
  const item = cart.items.id(req.params.itemId);
  if (!item) throw new AppError("Item not found in cart.", 404);
  if (quantity < 1) throw new AppError("Quantity must be at least 1.", 400);
  item.quantity = quantity;
  await cart.save();
  return success(res, { cart }, "Quantity updated");
});

exports.removeItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) throw new AppError("Cart not found.", 404);
  const item = cart.items.id(req.params.itemId);
  if (!item) throw new AppError("Item not found.", 404);
  item.deleteOne();
  await cart.save();
  return success(res, { cart }, "Item removed");
});

exports.applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
  });
  if (!coupon) throw new AppError("Invalid coupon code.", 400);
  if (coupon.validUntil && coupon.validUntil < new Date())
    throw new AppError("Coupon has expired.", 400);
  if (coupon.usedCount >= coupon.usageLimit)
    throw new AppError("Coupon usage limit reached.", 400);

  const cart = await getOrCreate(req.user.id);
  const subtotal = cart.subtotal;
  if (subtotal < coupon.minOrder)
    throw new AppError(`Minimum order ₹${coupon.minOrder} required.`, 400);

  let discount =
    coupon.type === "percentage"
      ? Math.round((subtotal * coupon.value) / 100)
      : coupon.value;
  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);

  cart.couponCode = coupon.code;
  cart.discount = discount;
  await cart.save();
  return success(res, { cart, discount }, "Coupon applied");
});

exports.removeCoupon = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.id });
  if (cart) {
    cart.couponCode = null;
    cart.discount = 0;
    await cart.save();
  }
  return success(res, { cart }, "Coupon removed");
});

exports.clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate(
    { userId: req.user.id },
    { items: [], couponCode: null, discount: 0 },
  );
  return success(res, {}, "Cart cleared");
});
