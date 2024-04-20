import { Stack } from "expo-router";
import List from "../../src/screens/match/list";

export default function Entry(props) {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Matches",
        }}
      />

      <List {...props} />
    </>
  );
}
