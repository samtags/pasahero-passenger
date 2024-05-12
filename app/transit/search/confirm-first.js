import { Stack } from "expo-router";
import Text from "../../../src/components/text";
import TransitSearchConfirmFirst from "../../../src/screens/transit/search/confirm-first";

export default function TransitSearchConfirmFirstRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Text size={19} weight="bold" color="#353579">
              Confirm Pickup
            </Text>
          ),
          headerTitleAlign: "center",
        }}
      />
      <TransitSearchConfirmFirst />
    </>
  );
}
