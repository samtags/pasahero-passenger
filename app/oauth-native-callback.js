import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.back();
  }, []);

  return (
    <Stack.Screen
      options={{
        headerShown: false,
      }}
    />
  );
}
