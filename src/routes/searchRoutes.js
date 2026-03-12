const router = require("express").Router();
const ctrl = require("../controllers/searchController");

router.get("/", ctrl.search);
router.get("/suggestions", ctrl.suggestions);
router.get("/filters", ctrl.filters);

module.exports = router;
