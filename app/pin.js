import { Stack } from "expo-router";
import Pin from "../src/screens/pin";

export default function Entry(props) {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Pin",
        }}
      />
      <Pin {...props} />
    </>
  );
}
