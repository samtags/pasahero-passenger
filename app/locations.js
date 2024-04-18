import { Stack } from "expo-router";
import Location from "../src/screens/locations";

export default function Entry(props) {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Locations",
          headerShown: false,
        }}
      />
      <Location {...props} />
    </>
  );
}
