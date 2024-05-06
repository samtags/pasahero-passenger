import { Stack } from "expo-router";
import Profile from "../src/screens/profile";

export default function Entry(props) {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Profile",
        }}
      />
      <Profile {...props} />
    </>
  );
}
