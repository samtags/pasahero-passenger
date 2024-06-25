import { Stack } from "expo-router";
import Soon from "../src/screens/soon";

export default function Entry(props) {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <Soon {...props} />
    </>
  );
}
