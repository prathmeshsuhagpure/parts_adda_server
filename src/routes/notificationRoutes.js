const router = require("express").Router();
const ctrl = require("../controllers/notificationController");
const { protect } = require("../middlewares/auth");

router.post("/send", ctrl.send);
router.use(protect);
router.get("/", ctrl.getNotifications);
router.get("/unread-count", ctrl.unreadCount);
router.post("/read-all", ctrl.markAllRead);
router.post("/:id/read", ctrl.markRead);
module.exports = router;
