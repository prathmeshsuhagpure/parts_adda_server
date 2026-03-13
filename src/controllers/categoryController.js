/* const Category = require("../models/Category");
const Brand = require("../models/Brand");
const Vehicle = require("../models/Vehicle");
const Part = require("../models/Part");
const asyncHandler = require("../utils/asyncHandler");
const { success, created } = require("../utils/response");

const getCategories = asyncHandler(async (req, res) => {
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

const createCategory = asyncHandler(async (req, res) => {
  const cat = await Category.create(req.body);
  return created(res, { category: cat });
});

const getBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find({ isActive: true }).sort("name");
  return success(res, { brands });
});

const createBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.create(req.body);
  return created(res, { brand });
});

const getVehicleMakes = asyncHandler(async (req, res) => {
  const makes = await Vehicle.distinct("make");
  return success(res, { makes: makes.sort() });
});

const getModelsForMake = asyncHandler(async (req, res) => {
  const models = await Vehicle.distinct("model", { make: req.params.make });
  return success(res, { models: models.sort() });
});

const getYearsForModel = asyncHandler(async (req, res) => {
  const years = await Vehicle.distinct("year", {
    make: req.params.make,
    model: req.params.model,
  });
  return success(res, { years: years.sort((a, b) => b - a) });
});

const getPartsByCategory = asyncHandler(async (req, res) => {
  const parts = await Part.find({ categoryId: req.params.categoryId });
  return success(res, { parts });
});

const getSubcategories = asyncHandler(async (req, res) => {
  const subcategories = await Category.find({
    parentId: req.params.categoryId,
  });
  return success(res, { subcategories });
});

module.exports = {
  getCategories,
  createCategory,
  getBrands,
  createBrand,
  getVehicleMakes,
  getModelsForMake,
  getYearsForModel,
  getPartsByCategory,
  getSubcategories,
};
 */

const Category = require("../models/Category");

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ path: 1 });

    res.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getRootCategories = async (req, res) => {
  try {
    const categories = await Category.find({ level: 0 });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSubCategories = async (req, res) => {
  try {
    const { id } = req.params;

    const categories = await Category.find({ parent: id });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCategoryTree = async (req, res) => {
  try {
    const categories = await Category.find().sort({ path: 1 });

    const map = {};
    const roots = [];

    categories.forEach((cat) => {
      map[cat._id] = { ...cat._doc, children: [] };
    });

    categories.forEach((cat) => {
      if (cat.parent) {
        map[cat.parent]?.children.push(map[cat._id]);
      } else {
        roots.push(map[cat._id]);
      }
    });

    res.json({
      success: true,
      data: roots,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllCategories,
  getRootCategories,
  getSubCategories,
  getCategoryTree,
};
