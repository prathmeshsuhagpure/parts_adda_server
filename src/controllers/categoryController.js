const Category = require("../models/Category");
const Brand = require("../models/Brand");
const Vehicle = require("../models/Vehicle");
const asyncHandler = require("../utils/asyncHandler");
const { success, created } = require("../utils/response");

exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort(
    "sortOrder name",
  );
  // Build tree
  const map = {};
  const roots = [];
  categories.forEach((c) => {
    map[c._id] = { ...c.toObject(), children: [] };
  });
  categories.forEach((c) => {
    if (c.parentId && map[c.parentId])
      map[c.parentId].children.push(map[c._id]);
    else roots.push(map[c._id]);
  });
  return success(res, { categories: roots });
});

exports.createCategory = asyncHandler(async (req, res) => {
  const cat = await Category.create(req.body);
  return created(res, { category: cat });
});

exports.getBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find({ isActive: true }).sort("name");
  return success(res, { brands });
});

exports.createBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.create(req.body);
  return created(res, { brand });
});

exports.getVehicleMakes = asyncHandler(async (req, res) => {
  const makes = await Vehicle.distinct("make");
  return success(res, { makes: makes.sort() });
});

exports.getModelsForMake = asyncHandler(async (req, res) => {
  const models = await Vehicle.distinct("model", { make: req.params.make });
  return success(res, { models: models.sort() });
});

exports.getYearsForModel = asyncHandler(async (req, res) => {
  const years = await Vehicle.distinct("year", {
    make: req.params.make,
    model: req.params.model,
  });
  return success(res, { years: years.sort((a, b) => b - a) });
});
