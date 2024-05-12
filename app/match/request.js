import { Stack } from "expo-router";
import MatchRequestScreen from "../../src/screens/match/request";

export default function Request() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <MatchRequestScreen />
    </>
  );
}
