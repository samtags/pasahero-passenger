import { Stack, useNavigation } from "expo-router";
import { useEffect } from "react";

export default function Home() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: "index" }],
    });
  }, []);

  return (
    <Stack.Screen
      options={{
        headerShown: false,
      }}
    />
  );
}
