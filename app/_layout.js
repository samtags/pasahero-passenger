import { Stack } from "expo-router/stack";
import { ClerkProvider } from "@clerk/clerk-expo";
import Const from "expo-constants";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useReactQueryDevTools } from "@dev-plugins/react-query";
import SignIn from "../src/components/signIn";
import tokenCache from "../src/services/auth/tokenCache";
import LaunchdarklyProvider from "../src/services/launchdarkly/Provider";
import Mapbox from "@rnmapbox/maps";
import { useFonts } from "expo-font";

Mapbox.setAccessToken(Const.expoConfig.extra.mapBoxKey);

const queryClient = new QueryClient({});

export default function Layout() {
  const [fontsLoaded] = useFonts({
    "Lato-Thin": require("../assets/fonts/Lato/Lato-Thin.ttf"),
    "Lato-Light": require("../assets/fonts/Lato/Lato-Light.ttf"),
    "Lato-Regular": require("../assets/fonts/Lato/Lato-Regular.ttf"),
    "Lato-Bold": require("../assets/fonts/Lato/Lato-Bold.ttf"),
    "Lato-Black": require("../assets/fonts/Lato/Lato-Black.ttf"),
  });

  useReactQueryDevTools(queryClient);

  // todo: splash screen
  if (!fontsLoaded) return null;

  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={Const.expoConfig.extra.clerkPublishableKey}
    >
      <QueryClientProvider client={queryClient}>
        <LaunchdarklyProvider>
          <Stack />
          {/* <SignIn /> */}
        </LaunchdarklyProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
