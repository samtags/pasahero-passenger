import { Slot } from "expo-router";
import { ClerkProvider } from "@clerk/clerk-expo";
import Const from "expo-constants";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useReactQueryDevTools } from "@dev-plugins/react-query";

const queryClient = new QueryClient({});

export default function Layout() {
  useReactQueryDevTools(queryClient);
  return (
    <ClerkProvider publishableKey={Const.expoConfig.extra.clerkPublishableKey}>
      <QueryClientProvider client={queryClient}>
        <Slot />
      </QueryClientProvider>
    </ClerkProvider>
  );
}
