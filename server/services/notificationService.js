import admin from "../config/firebase.js";

export const sendPushNotification = async ({
  token,
  title,
  body,
  data = {},
}) => {
  if (!token) {
    console.log("❌ No FCM token found. Notification skipped.");
    return;
  }

  const message = {
  token,
  notification: {
    title,
    body,
  },
  webpush: {
    headers: {
      Urgency: "high",
    },
    notification: {
      icon: "/logo.png",
      requireInteraction: true,
    },
  },
  data,
};


  try {
    const response = await admin.messaging().send(message);
    console.log("✅ Push notification sent:", response);
  } catch (error) {
    console.error("❌ Firebase push error:", error.message);
  }
};
