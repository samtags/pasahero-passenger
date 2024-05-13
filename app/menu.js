import { Stack } from "expo-router";
import Text from "../src/components/text";

export default function Entry(props) {
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Text size={19} weight="bold" color="#353579">
              Account
            </Text>
          ),
          headerTitleAlign: "center",
        }}
      />
    </>
  );
}
