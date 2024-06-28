import { Stack } from "expo-router";
import Text from "../../../src/components/text";
import TransitSearchFirst from "../../../src/screens/transit/search/first";

export default function TransitSearchFirstRoute() {
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
      <TransitSearchFirst />
    </>
  );
}
