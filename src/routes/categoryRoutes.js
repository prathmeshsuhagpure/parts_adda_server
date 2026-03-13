const express = require("express");
const router = express.Router();

const {
  getAllCategories,
  getRootCategories,
  getSubCategories,
  getCategoryTree,
} = require("../controllers/categoryController");

router.get("/", getAllCategories);

router.get("/tree", getCategoryTree);

router.get("/root", getRootCategories);

router.get("/:id/sub", getSubCategories);

module.exports = router;
