const router = require("express").Router();
const ctrl = require("../controllers/searchController");
router.get("/", ctrl.search);
router.get("/suggestions", ctrl.suggestions);
router.post("/index", ctrl.indexPart);
router.delete("/index/:id", ctrl.removePart);
module.exports = router;
