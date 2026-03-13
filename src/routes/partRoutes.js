const express = require("express");
const router = express.Router();
const {
  listParts,
  getPartById,
  createPart,
  updatePart,
  getByOem,
  getPartsByCategory,
} = require("../controllers/partController");
const { protect } = require("../middlewares/auth");

router.get("/", listParts);

router.get("/:id", getPartById);

router.post("/", protect, createPart);

router.put("/:id", protect, updatePart);

router.get("/oem/:oemNumber", getByOem);

router.get("/:categoryId/parts", getPartsByCategory);
module.exports = router;
