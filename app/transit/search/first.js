import { Stack } from "expo-router";
import Text from "../../../src/components/text";
import TransitSearchFirst from "../../../src/screens/transit/search/first";
import TransitSearchFirstGrab from "../../../src/screens/transit/search/first.grab";
import Optional from "../../../src/components/optional";
import { useFeatureIsOn } from "@growthbook/growthbook-react";

export default function TransitSearchFirstRoute() {
  const isEnabledGrabAutoComplete = useFeatureIsOn(
    "enable-grab-auto-complete",
    false
  );

  return (
    <>
      <Stack.Screen
        options={{
          animation: "ios",
          headerTitle: () => (
            <Text size={19} weight="bold" color="#353579">
              Meet you at?
            </Text>
          ),
          headerTitleAlign: "center",
        }}
      />
      <Optional
        fallback={<TransitSearchFirst />}
        condition={isEnabledGrabAutoComplete}
      >
        <TransitSearchFirstGrab />
      </Optional>
    </>
  );
}
