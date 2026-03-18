const admin = require("firebase-admin");
const Notification = require("../models/Notification");

const sendNotification = async ({
  userId,
  title,
  body,
  type = "general",
  data = {},
  fcmToken,
}) => {
  // 1. Save in DB
  const notif = await Notification.create({
    userId,
    type,
    title,
    body,
    data,
  });

  // 2. Send push
  if (fcmToken) {
    try {
      await admin.messaging().send({
        token: fcmToken,
        notification: { title, body },
        data: Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, String(v)]),
        ),
      });
    } catch (err) {
      console.error("FCM error:", err.message);
    }
  }

  return notif;
};

module.exports = sendNotification;
