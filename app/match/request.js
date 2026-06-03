import { Stack, useRouter } from "expo-router";
import MatchRequestScreen from "../../src/screens/match/request";
import * as WebBrowser from "expo-web-browser";
import { useWarmUpBrowser } from "../../src/services/hooks/useWarmUpBrowser";
import RequestNew from "../../src/screens/match/requests_v2";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import Text from "../../src/components/text";
import { HeaderBackButton } from "@react-navigation/elements";
import { Alert, View } from "react-native";
import { useRouterParams } from "../../src/services/router";
import route from "../../src/services/router";

WebBrowser.maybeCompleteAuthSession();

export default function Request() {
  const isEnabled = useFeatureIsOn("enable-match-request-new-ui", false);
  const router = useRouter();
  const params = useRouterParams();

  useWarmUpBrowser();

  function handlePressBack() {
    Alert.alert("Discard request?", "Do you want to discard this request?", [
      { text: "Cancel", style: "cancel", onPress: () => {} },
      {
        text: "OK",
        style: "default",
        onPress: () => {
          if (params?.from) {
            return route.navigate(params.from);
          }

          router.navigate("/");
        },
      },
    ]);
  }

  if (isEnabled)
    return (
      <>
        <Stack.Screen
          options={{
            // animation: "ios",
            headerTitle: () => (
              <Text size={19} weight="bold" color="#353579">
                Request Ride
              </Text>
            ),
            headerTitleAlign: "center",
            headerTintColor: "#757477",
            headerBackVisible: false,
            headerLeft: (props) => (
              <View style={{ marginLeft: -12 }}>
                <HeaderBackButton {...props} onPress={handlePressBack} />
              </View>
            ),
          }}
        />
        <RequestNew />
      </>
    );

  return (
    <>
      <Stack.Screen
        options={{
          // animation: "ios",
          headerShown: false,
        }}
      />
      <MatchRequestScreen />
    </>
  );
}
