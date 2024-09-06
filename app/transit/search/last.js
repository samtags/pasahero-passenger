import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { Stack, useNavigation } from "expo-router";
import Text from "../../../src/components/text";
import TransitSearchLast from "../../../src/screens/transit/search/last";
import { useEffect } from "react";
import TransitSearchLastGrab from "../../../src/screens/transit/search/last.grab";
import Optional from "../../../src/components/optional";
import log from "../../../src/services/log";

export default function TransitSearchLastRoute() {
  const navigation = useNavigation();
  const isEnabledGrabAutoComplete = useFeatureIsOn("enable-grab-auto-complete", false); // prettier-ignore

  useEffect(() => {
    function handleBeforeRemove(e) {
      if (e.data.action.type === "POP") {
        log.debug("User cancel search from select destination.");
      }
    }

    navigation.addListener("beforeRemove", handleBeforeRemove);

    return () => {
      navigation.removeListener("beforeRemove", handleBeforeRemove);
    };
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          animation: "ios",
          headerTitle: () => (
            <Text size={19} weight="bold" color="#353579">
              Going to?
            </Text>
          ),
          headerTitleAlign: "center",
          headerTintColor: "#757477",
        }}
      />
      <Optional
        fallback={<TransitSearchLast />}
        condition={isEnabledGrabAutoComplete}
      >
        <TransitSearchLastGrab />
      </Optional>
    </>
  );
}
