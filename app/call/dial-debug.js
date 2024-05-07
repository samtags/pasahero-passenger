import { Stack, useRouter } from "expo-router";
import { TextInput, View, Button } from "react-native";
import { useState } from "react";

export default function Entry(props) {
  const router = useRouter();
  const [value, setValue] = useState("");

  return (
    <>
      <Stack.Screen
        options={{
          title: "Dial",
        }}
      />
      <View
        style={{
          padding: 16,
          gap: 12,
          flex: 1,
          justifyContent: "space-between",
        }}
      >
        <TextInput
          autoFocus
          onChangeText={setValue}
          value={value}
          style={{ fontSize: 16 }}
          placeholder="Enter user to call"
        />
        <Button
          color="#9ca3af"
          title="Dial"
          onPress={() => {
            router.navigate({
              pathname: "/call/dial",
              params: {
                roomId: value,
              },
            });
          }}
        />
      </View>
    </>
  );
}
