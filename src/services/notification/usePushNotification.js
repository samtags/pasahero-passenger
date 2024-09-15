import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import log from "../log";
import * as Device from "expo-device";
import messaging from "@react-native-firebase/messaging";
import useOnUpdate from "../hooks/useOnUpdate";
import { useRouter } from "expo-router";

export default function usePushNotification(userId) {
  const router = useRouter();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        log.debug("Received notification response.", response);

        const notificationRoute =
          response.notification.request.content?.data?.route;

        if (notificationRoute) {
          const params =
            response.notification.request.content.data.params || {};

          router.navigate({
            pathname: notificationRoute,
            params,
          });
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  useOnUpdate(() => {
    if (userId) {
      messaging()
        .subscribeToTopic(userId)
        .then(() =>
          log.debug("Subscribed to firebase cloud messaging via topic.", {
            userId,
            topic: userId,
          })
        )
        .catch(
          (err) => log.warn("Unable to subscribe to topic.", { userId, topic: userId, error: err }) // prettier-ignore
        );

      return () => {
        messaging()
          .unsubscribeFromTopic(userId)
          .finally(() =>
            log.debug("Unsubscribed from topic.", { userId, topic: userId })
          );
      };
    }
  }, [userId]);

  useEffect(() => {
    registerForPushNotificationsAsync();

    const onForegroundMessageSubscription = messaging().onMessage(
      async (remoteMessage) => {
        log.debug("Incoming push notification", remoteMessage);
      }
    );

    return () => {
      log.debug("Unsubscribing to foreground message subscription.");
      onForegroundMessageSubscription?.();
    };
  }, []);
}

async function registerForPushNotificationsAsync() {
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
