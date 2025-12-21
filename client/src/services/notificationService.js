import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebase";
import axios from "axios";


onMessage(messaging, (payload) => {
  console.log("🔥 Foreground message received:", payload);

  if (Notification.permission === "granted") {
    new Notification(payload.notification.title, {
      body: payload.notification.body,
      icon: "/logo.png",
    });
  }
});

// Ask permission + get FCM token + send to backend
export const registerForPushNotifications = async (jwtToken) => {
  try {
    // 1️⃣ Ask browser permission
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("🔕 Notification permission denied");
      return;
    }

    // 2️⃣ Get FCM token
    const fcmToken = await getToken(messaging, {
      vapidKey: "BBQILzSNwwzYyMcpxn2f_cbk8ufq2zs8xu999EEAUCGpfiek0oCDA5Cni6Ogdjr3aHQMNwI30pa7U36zPYNGUpI",
    });

    if (!fcmToken) {
      console.log("❌ Failed to get FCM token");
      return;
    }

    console.log("✅ FCM Token:", fcmToken);

    // 3️⃣ Send token to backend
    await axios.post(
      "/api/auth/save-fcm-token",
      { token: fcmToken },
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );

    console.log("✅ FCM token saved to backend");
  } catch (error) {
    console.error("❌ Push notification setup error:", error);
  }
};
