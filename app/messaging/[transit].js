import { Stack } from "expo-router";
import Messaging from "../../src/screens/messaging/messaging";

export default function Transit() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Messaging",
        }}
      />
      <Messaging />
    </>
  );
}
