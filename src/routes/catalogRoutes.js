const router = require("express").Router();
const partCtrl = require("../controllers/partController");
const catCtrl = require("../controllers/categoryController");
const { protect, restrictTo } = require("../middlewares/auth");

// ── Public ────────────────────────────────────────────────────
router.get("/parts", partCtrl.listParts);
router.get("/parts/oem/:oemNumber", partCtrl.getByOem);
router.get("/parts/:id", partCtrl.getPartById);
router.get("/categories", catCtrl.getCategories);
router.get("/brands", catCtrl.getBrands);
router.get("/vehicles/makes", catCtrl.getVehicleMakes);
router.get("/vehicles/:make/models", catCtrl.getModelsForMake);
router.get("/vehicles/:make/:model/years", catCtrl.getYearsForModel);

// ── Authenticated ─────────────────────────────────────────────
router.post("/parts/:id/reviews", protect, partCtrl.addReview);

// ── Vendor / Admin ────────────────────────────────────────────
router.post(
  "/parts",
  protect,
  restrictTo("vendor", "admin"),
  partCtrl.createPart,
);
router.put(
  "/parts/:id",
  protect,
  restrictTo("vendor", "admin"),
  partCtrl.updatePart,
);
router.post(
  "/categories",
  protect,
  restrictTo("admin"),
  catCtrl.createCategory,
);
router.post("/brands", protect, restrictTo("admin"), catCtrl.createBrand);

module.exports = router;
