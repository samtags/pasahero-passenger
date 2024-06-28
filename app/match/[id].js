import { Stack } from "expo-router";
import Match from "../../src/screens/match/[id]";

export default function Entry(props) {
  return (
    <>
      <Stack.Screen
        options={{
          animation: "ios",
          headerShown: false,
        }}
      />
      <Match {...props} />
    </>
  );
}
