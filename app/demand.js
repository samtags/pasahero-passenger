import { Stack } from "expo-router";
import Demand from "../src/screens/demand";

export default function Entry(props) {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Demand",
        }}
      />
      <Demand {...props} />
    </>
  );
}
