const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");
const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const { success, paginated } = require("../utils/response");

if (!admin.apps.length) {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT is not set. Check your .env file.",
    );
  }
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ── Send FCM push ─────────────────────────────────────────────
const sendPush = async (fcmToken, title, body, data = {}) => {
  if (!fcmToken) return;
  try {
    await admin
      .messaging()
      .send({ token: fcmToken, notification: { title, body }, data });
  } catch (err) {
    console.error("FCM error:", err.message);
  }
};

// ── Send email ────────────────────────────────────────────────
const sendEmail = async (to, subject, html) => {
  if (!process.env.SENDGRID_API_KEY) {
    console.log(`📧 [DEV] Email to ${to}: ${subject}`);
    return;
  }
  try {
    await sgMail.send({ to, from: process.env.SENDGRID_FROM, subject, html });
  } catch (err) {
    console.error("SendGrid error:", err.message);
  }
};

// ── POST /notifications/send (internal) ──────────────────────
const sendNotification = asyncHandler(async (req, res) => {
  const { userId, type, title, body, data, fcmToken, email } = req.body;

  const notif = await Notification.create({
    userId,
    type,
    title,
    body,
    data,
  });

  if (fcmToken) await sendPush(fcmToken, title, body, data || {});
  if (email) await sendEmail(email, title, `<p>${body}</p>`);
  return success(res, { notification: notif });
});

// ── GET /notifications ────────────────────────────────────────
const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const [notifs, total] = await Promise.all([
    Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Notification.countDocuments({ userId: req.user.id }),
  ]);
  return paginated(res, notifs, total, page, limit);
});

// ── POST /notifications/:id/read ──────────────────────────────
const markRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { read: true },
  );
  return success(res, {}, "Marked as read");
});

// ── POST /notifications/read-all ──────────────────────────────
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user.id, read: false },
    { read: true },
  );
  return success(res, {}, "All notifications marked as read");
});

// ── GET /notifications/unread-count ───────────────────────────
const unreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    userId: req.user.id,
    read: false,
  });
  return success(res, { count });
});

module.exports = {
  send: sendNotification,
  getNotifications,
  markRead,
  markAllRead,
  unreadCount,
};
