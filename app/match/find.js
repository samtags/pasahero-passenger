import { Stack } from "expo-router";
import Text from "../../src/components/text";
import Find from "../../src/screens/match/find";

export default function Entry(props) {
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
      <Find />
    </>
  );
}
