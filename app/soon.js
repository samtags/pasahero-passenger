import { Stack } from "expo-router";
import Soon from "../src/screens/soon";

export default function Entry(props) {
  return (
    <>
      <Stack.Screen
        options={{
          // animation: "ios",
          headerShown: false,
        }}
      />
      <Soon {...props} />
    </>
  );
}
