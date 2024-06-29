import "react-native-gesture-handler";
import "react-native-reanimated";
import { Stack } from "expo-router/stack";
import { ClerkProvider } from "@clerk/clerk-expo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useReactQueryDevTools } from "@dev-plugins/react-query";
import tokenCache from "../src/services/auth/tokenCache";
import LaunchdarklyProvider from "../src/services/launchdarkly/Provider";
import Mapbox from "@rnmapbox/maps";
import { useFonts } from "expo-font";
import { useWarmUpBrowser } from "../src/services/hooks/useWarmUpBrowser";
import * as WebBrowser from "expo-web-browser";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MessageProvider from "../src/services/messages/Provider";
import Cancelation from "../src/services/trip/Cancelation";
import { UNSAFE_registerProperty } from "../src/services/global";
import usePushNotification from "../src/services/notification/usePushNotification";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

WebBrowser.maybeCompleteAuthSession();
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY);

const queryClient = new QueryClient({});
UNSAFE_registerProperty("__queryClient__", queryClient);

export default function Layout() {
  const [fontsLoaded] = useFonts({
    "Lato-Thin": require("../assets/fonts/Lato/Lato-Thin.ttf"),
    "Lato-Light": require("../assets/fonts/Lato/Lato-Light.ttf"),
    "Lato-Regular": require("../assets/fonts/Lato/Lato-Regular.ttf"),
    "Lato-Bold": require("../assets/fonts/Lato/Lato-Bold.ttf"),
    "Lato-Black": require("../assets/fonts/Lato/Lato-Black.ttf"),
  });

  useReactQueryDevTools(queryClient);
  useWarmUpBrowser();
  usePushNotification();

  // todo: splash screen
  if (!fontsLoaded) return null;

  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <QueryClientProvider client={queryClient}>
        <LaunchdarklyProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack />
            <MessageProvider />
            <Cancelation />
          </GestureHandlerRootView>
        </LaunchdarklyProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
