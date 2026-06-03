import { Stack } from "expo-router";
import Wallet from "../src/screens/wallet";

export default function Entry(props) {
  return (
    <>
      <Stack.Screen
        options={{
          // animation: "ios",
          title: "Wallet",
        }}
      />
      <Wallet {...props} />
    </>
  );
}
