import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import log from "../log";
import handler from "./handlers";
import * as Device from "expo-device";
import { Platform } from "react-native";

export default function usePushNotification() {
  useEffect(() => {
    registerForPushNotificationsAsync();

    Notifications.addNotificationReceivedListener((notification) => {
      log.debug("Push notification received.", notification);
      handler(notification);
    });

    Notifications.addNotificationResponseReceivedListener((response) => {
      log.debug("Push notification response received", response);
    });
  }, []);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync(); // prettier-ignore
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      log.warn("User opted out of notifications.");
    }
  } else {
    log.warn("Must use physical device for Push Notifications");
  }
}

Notifications.setNotificationHandler({
  handleNotification: () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
