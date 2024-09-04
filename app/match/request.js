import { Stack } from "expo-router";
import MatchRequestScreen from "../../src/screens/match/request";
import * as WebBrowser from "expo-web-browser";
import { useWarmUpBrowser } from "../../src/services/hooks/useWarmUpBrowser";
import RequestNew from "../../src/screens/match/requests_v2";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import Text from "../../src/components/text";

WebBrowser.maybeCompleteAuthSession();

export default function Request() {
  const isEnabled = useFeatureIsOn("enable-match-request-new-ui", false);

  useWarmUpBrowser();

  if (isEnabled)
    return (
      <>
        <Stack.Screen
          options={{
            animation: "ios",
            headerTitle: () => (
              <Text size={19} weight="bold" color="#353579">
                Request Ride
              </Text>
            ),
            headerTitleAlign: "center",
            headerTintColor: "#757477",
          }}
        />
        <RequestNew />
      </>
    );

  return (
    <>
      <Stack.Screen
        options={{
          animation: "ios",
          headerShown: false,
        }}
      />
      <MatchRequestScreen />
    </>
  );
}
