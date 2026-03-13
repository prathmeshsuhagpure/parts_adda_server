const Part = require("../models/Part");
const Review = require("../models/Review");
const AppError = require("../utils/appError");
const asyncHandler = require("..//utils/asyncHandler");
const { success, created, paginated } = require("../utils/response");

// ── GET /parts ────────────────────────────────────────────────
const listParts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    category,
    brand,
    make,
    model,
    year,
    minPrice,
    maxPrice,
    inStock,
    sortBy = "createdAt",
  } = req.query;
  const skip = (page - 1) * limit;
  const filter = { isActive: true };

  if (category) filter.categoryId = category;
  if (brand) filter.brandId = brand;
  if (inStock === "true") filter.stock = { $gt: 0 };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (make && model) {
    filter["compatibility.make"] = make;
    filter["compatibility.model"] = model;
    if (year) filter["compatibility.yearFrom"] = { $lte: Number(year) };
  }

  const sortMap = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating: { rating: -1 },
    newest: { createdAt: -1 },
    popular: { soldCount: -1 },
  };
  const sort = sortMap[sortBy] || { createdAt: -1 };

  const [parts, total] = await Promise.all([
    Part.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate("brandId", "name logo isOEM")
      .populate("categoryId", "name slug"),
    Part.countDocuments(filter),
  ]);

  return paginated(res, parts, total, page, limit);
});

// ── GET /parts/:id ────────────────────────────────────────────
const getPartById = asyncHandler(async (req, res) => {
  const part = await Part.findOne({ _id: req.params.id, isActive: true })
    .populate("brandId", "name logo country isOEM")
    .populate("categoryId", "name slug parentId");
  if (!part) throw new AppError("Part not found.", 404);

  const reviews = await Review.find({ partId: part._id })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("userId", "name avatar");

  return success(res, { part, reviews });
});

// ── POST /parts (vendor) ──────────────────────────────────────
const createPart = asyncHandler(async (req, res) => {
  const {
    name,
    sku,
    description,
    oemNumber,
    brandId,
    categoryId,
    images,
    specifications,
    compatibility,
    price,
    mrp,
    stock,
  } = req.body;

  const part = await Part.create({
    name,
    sku,
    description,
    oemNumber,
    brandId,
    categoryId,
    images: images || [],
    specifications,
    compatibility: compatibility || [],
    sellerListings: [
      {
        sellerId: req.user.id,
        sellerName: req.user.name || "Seller",
        price,
        mrp,
        stock: stock || 0,
      },
    ],
  });
  part.syncAggregates();
  await part.save();
  return created(res, { part }, "Part created");
});

// ── PUT /parts/:id (vendor) ───────────────────────────────────
const updatePart = asyncHandler(async (req, res) => {
  const part = await Part.findById(req.params.id);
  if (!part) throw new AppError("Part not found.", 404);

  const listing = part.sellerListings.find(
    (l) => l.sellerId.toString() === req.user.id,
  );
  if (!listing && req.user.role !== "admin")
    throw new AppError("You cannot edit this part.", 403);

  // Vendor can only update their listing
  if (listing) {
    const { price, mrp, stock, dealerPrice, isFreeDelivery } = req.body;
    if (price !== undefined) listing.price = price;
    if (mrp !== undefined) listing.mrp = mrp;
    if (stock !== undefined) listing.stock = stock;
    if (dealerPrice !== undefined) listing.dealerPrice = dealerPrice;
    if (isFreeDelivery !== undefined) listing.isFreeDelivery = isFreeDelivery;
  }

  // Admin can update catalog fields
  if (req.user.role === "admin") {
    const fields = [
      "name",
      "description",
      "images",
      "specifications",
      "compatibility",
      "tags",
      "isActive",
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) part[f] = req.body[f];
    });
  }

  part.syncAggregates();
  await part.save();
  return success(res, { part }, "Part updated");
});

// ── GET /parts/oem/:oemNumber ─────────────────────────────────
const getByOem = asyncHandler(async (req, res) => {
  const part = await Part.findOne({
    oemNumber: req.params.oemNumber,
    isActive: true,
  })
    .populate("brandId", "name logo")
    .populate("categoryId", "name");
  if (!part) throw new AppError("Part not found for OEM number.", 404);
  return success(res, { part });
});

// ── POST /parts/:id/reviews ───────────────────────────────────
const addReview = asyncHandler(async (req, res) => {
  const { rating, title, comment, orderId } = req.body;
  const existing = await Review.findOne({
    partId: req.params.id,
    userId: req.user.id,
  });
  if (existing) throw new AppError("You have already reviewed this part.", 409);

  const review = await Review.create({
    partId: req.params.id,
    userId: req.user.id,
    orderId,
    rating,
    title,
    comment,
    verified: !!orderId,
  });

  // Update part aggregated rating
  const agg = await Review.aggregate([
    { $match: { partId: review.partId } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  if (agg.length) {
    await Part.findByIdAndUpdate(req.params.id, {
      rating: Math.round(agg[0].avg * 10) / 10,
      reviewCount: agg[0].count,
    });
  }

  return created(res, { review }, "Review submitted");
});

const getPartsByCategory = asyncHandler(async (req, res) => {
  const parts = await Part.find({ categoryId: req.params.categoryId });
  return success(res, { parts });
});

module.exports = {
  listParts,
  getPartById,
  createPart,
  updatePart,
  getByOem,
  addReview,
  getPartsByCategory,
};
