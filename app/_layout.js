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
import RequestTimeout from "../src/services/trip/RequestTimeout";
import { UNSAFE_registerProperty } from "../src/services/global";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import onFetchUpdateAsync from "../src/services/updates";
import ImagePreRenderer from "../src/services/images/PreRenderer";
import GrowthBook from "../src/services/growthbook";

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

  useEffect(() => {
    onFetchUpdateAsync(); // check for codepush updates
  }, []);

  useReactQueryDevTools(queryClient);
  useWarmUpBrowser();

  // todo: splash screen
  if (!fontsLoaded) return null;

  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <QueryClientProvider client={queryClient}>
        <GrowthBook>
          <LaunchdarklyProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <ImagePreRenderer />
              <Stack />
              <MessageProvider />
              <Cancelation />
              <RequestTimeout />
            </GestureHandlerRootView>
          </LaunchdarklyProvider>
        </GrowthBook>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
