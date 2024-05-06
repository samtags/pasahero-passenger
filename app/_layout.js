import { Stack } from "expo-router/stack";
import { ClerkProvider } from "@clerk/clerk-expo";
import Const from "expo-constants";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useReactQueryDevTools } from "@dev-plugins/react-query";
import SignIn from "../src/components/signIn";
import tokenCache from "../src/services/auth/tokenCache";
import LaunchdarklyProvider from "../src/services/launchdarkly/Provider";

const queryClient = new QueryClient({});

export default function Layout() {
  useReactQueryDevTools(queryClient);

  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={Const.expoConfig.extra.clerkPublishableKey}
    >
      <QueryClientProvider client={queryClient}>
        <LaunchdarklyProvider>
          <Stack />
          <SignIn />
        </LaunchdarklyProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
