import { Slot } from "expo-router";
import { ClerkProvider } from "@clerk/clerk-expo";
import Const from "expo-constants";

export default function Layout() {
  return (
    <ClerkProvider publishableKey={Const.expoConfig.extra.clerkPublishableKey}>
      <Slot />
    </ClerkProvider>
  );
}
