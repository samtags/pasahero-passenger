import { Stack } from "expo-router";
import Match from "../../src/screens/match";

export default function Entry(props) {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Find",
        }}
      />
      <Match {...props} />
    </>
  );
}
