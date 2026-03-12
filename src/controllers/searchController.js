const Part = require("../models/Part");
const asyncHandler = require("../utils/asyncHandler");
const { success, paginated } = require("../utils/response");

const search = asyncHandler(async (req, res) => {
  const {
    q = "",
    brand,
    category,
    make,
    model,
    year,
    minPrice,
    maxPrice,
    inStock,
    sortBy = "relevance",
    page = 1,
    limit = 20,
  } = req.query;

  const query = {};

  /* TEXT SEARCH */
  if (q) {
    query.$text = { $search: q };
  }

  /* FILTERS */

  if (brand) query.brand = brand;
  if (category) query.categoryId = category;

  if (inStock === "true") query.stock = { $gt: 0 };

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (make || model || year) {
    query.compatibility = {
      $elemMatch: {
        ...(make && { make }),
        ...(model && { model }),
        ...(year && {
          yearFrom: { $lte: Number(year) },
          yearTo: { $gte: Number(year) },
        }),
      },
    };
  }

  const skip = (page - 1) * limit;

  let sort = {};

  switch (sortBy) {
    case "price_asc":
      sort = { price: 1 };
      break;
    case "price_desc":
      sort = { price: -1 };
      break;
    case "rating":
      sort = { rating: -1 };
      break;
    case "popular":
      sort = { soldCount: -1 };
      break;
    default:
      sort = { score: { $meta: "textScore" } };
  }

  const parts = await Part.find(query, {
    score: { $meta: "textScore" },
  })
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  const total = await Part.countDocuments(query);

  res.json({
    success: true,
    data: parts,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  });
});

const suggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.length < 2) {
    return res.json({ success: true, suggestions: [] });
  }

  const parts = await Part.find({
    name: { $regex: `^${q}`, $options: "i" },
  })
    .limit(8)
    .select("name sku brand");

  const suggestions = parts.map((p) => ({
    id: p._id,
    name: p.name,
    sku: p.sku,
    brand: p.brand,
  }));

  res.json({
    success: true,
    suggestions,
  });
});

const filters = asyncHandler(async (req, res) => {
  const result = await Part.aggregate([
    {
      $facet: {
        brands: [
          { $group: { _id: "$brand", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
        categories: [{ $group: { _id: "$categoryName", count: { $sum: 1 } } }],
        priceRange: [
          {
            $group: {
              _id: null,
              min: { $min: "$price" },
              max: { $max: "$price" },
            },
          },
        ],
      },
    },
  ]);

  res.json({
    success: true,
    filters: result[0],
  });
});

module.exports = {
  search,
  suggestions,
  filters,
};
