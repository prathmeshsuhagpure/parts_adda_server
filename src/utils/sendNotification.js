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
  const notif = await Notification.create({
    userId,
    type,
    title,
    body,
    data,
  });

  console.log("📩 Notification saved:", notif._id.toString());
  console.log("📱 Sending to token:", fcmToken);

  if (fcmToken) {
    try {
      const message = {
        token: fcmToken,
        notification: { title, body },
        data: Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, String(v)]),
        ),

        // ✅ ADD THIS (IMPORTANT FOR ANDROID)
        android: {
          priority: "high",
          notification: {
            channelId: "default_channel",
            sound: "default",
          },
        },

        // ✅ ADD THIS (IMPORTANT FOR iOS)
        apns: {
          payload: {
            aps: {
              sound: "default",
            },
          },
        },
      };

      const response = await admin.messaging().send(message);

      console.log("✅ FCM SENT SUCCESS:", response);
    } catch (err) {
      console.error("❌ FCM ERROR:", err.message);
    }
  } else {
    console.log("⚠️ No FCM token found");
  }

  return notif;
};

module.exports = sendNotification;
