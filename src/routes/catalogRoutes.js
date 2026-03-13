const router = require("express").Router();
const {
  getPartById,
  listParts,
  getByOem,
  createPart,
  updatePart,
  addReview,
} = require("../controllers/partController");
const catCtrl = require("../controllers/categoryController");
const { protect, restrictTo } = require("../middlewares/auth");

// ── Public ────────────────────────────────────────────────────
router.get("/parts", listParts);
router.get("/parts/oem/:oemNumber", getByOem);
router.get("/parts/:id", getPartById);
/* router.get("/categories", catCtrl.getCategories);
router.get("/brands", catCtrl.getBrands);
router.get("/vehicles/makes", catCtrl.getVehicleMakes);
router.get("/vehicles/:make/models", catCtrl.getModelsForMake);
router.get("/vehicles/:make/:model/years", catCtrl.getYearsForModel);
router.get("/categories/:categoryId/parts", catCtrl.getPartsByCategory);
router.get("/categories/:categoryId/subcategories", catCtrl.getSubcategories); */

// ── Authenticated ─────────────────────────────────────────────
router.post("/parts/:id/reviews", protect, addReview);

// ── Vendor / Admin ────────────────────────────────────────────
router.post("/parts", protect, restrictTo("vendor", "admin"), createPart);
router.put("/parts/:id", protect, restrictTo("vendor", "admin"), updatePart);
/* router.post(
  "/categories",
  protect,
  restrictTo("admin"),
  catCtrl.createCategory,
);
router.post("/brands", protect, restrictTo("admin"), catCtrl.createBrand); */

module.exports = router;
