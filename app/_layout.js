import "react-native-gesture-handler";
import "react-native-reanimated";
import { Stack } from "expo-router/stack";
import { ClerkProvider } from "@clerk/clerk-expo";
import Const from "expo-constants";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useReactQueryDevTools } from "@dev-plugins/react-query";
import tokenCache from "../src/services/auth/tokenCache";
import LaunchdarklyProvider from "../src/services/launchdarkly/Provider";
import Mapbox from "@rnmapbox/maps";
import { useFonts } from "expo-font";
import { useWarmUpBrowser } from "../src/services/hooks/useWarmUpBrowser";
import * as WebBrowser from "expo-web-browser";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import NewRelic from "newrelic-react-native-agent";
import { Platform } from "react-native";
import ErrorBoundary from "../src/services/error";
import MessageProvider from "../src/services/messages/Provider";

WebBrowser.maybeCompleteAuthSession();
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
  useWarmUpBrowser();

  // todo: splash screen
  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <ClerkProvider
        tokenCache={tokenCache}
        publishableKey={Const.expoConfig.extra.clerkPublishableKey}
      >
        <QueryClientProvider client={queryClient}>
          <LaunchdarklyProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <Stack />
              <MessageProvider />
            </GestureHandlerRootView>
          </LaunchdarklyProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </ErrorBoundary>
  );
}

let appToken = process.env.EXPO_PUBLIC_NEW_RELIC_ANDROID_KEY;

if (Platform.OS === "ios") {
  appToken = process.env.EXPO_PUBLIC_NEW_RELIC_IOS_KEY;
}

const agentConfiguration = {
  //Android Specific
  // Optional:Enable or disable collection of event data.
  analyticsEventEnabled: true,

  // Optional:Enable or disable crash reporting.
  crashReportingEnabled: true,

  // Optional:Enable or disable interaction tracing. Trace instrumentation still occurs, but no traces are harvested. This will disable default and custom interactions.
  interactionTracingEnabled: true,

  // Optional:Enable or disable reporting successful HTTP requests to the MobileRequest event type.
  networkRequestEnabled: true,

  // Optional:Enable or disable reporting network and HTTP request errors to the MobileRequestError event type.
  networkErrorRequestEnabled: true,

  // Optional:Enable or disable capture of HTTP response bodies for HTTP error traces, and MobileRequestError events.
  httpResponseBodyCaptureEnabled: true,

  // Optional:Enable or disable agent logging.
  loggingEnabled: true,

  // Optional:Specifies the log level. Omit this field for the default log level.
  // Options include: ERROR (least verbose), WARNING, INFO, VERBOSE, AUDIT (most verbose).
  logLevel: NewRelic.LogLevel.DEBUG,

  // iOS Specific
  // Optional:Enable/Disable automatic instrumentation of WebViews
  webViewInstrumentation: true,

  // Optional:Set a specific collector address for sending data. Omit this field for default address.
  // collectorAddress: "",

  // Optional:Set a specific crash collector address for sending crashes. Omit this field for default address.
  // crashCollectorAddress: ""
};

NewRelic.startAgent(appToken, agentConfiguration);
NewRelic.setJSAppVersion("1.0.0");
