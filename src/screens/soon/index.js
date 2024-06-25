import { TouchableOpacity, View } from "react-native";
import Text from "../../components/text";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function Soon() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <StatusBar />

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          backgroundColor: "white",
          padding: 24,
          gap: 4,
        }}
      >
        <Text size={32} color="#1B1B1B">
          Soon
        </Text>
        <Text style={{ maxWidth: 380 }} textAlign="justified" color="#707070">
          ˈsu̇n
        </Text>

        <View style={{ marginTop: 8 }} />

        <Text style={{ maxWidth: 380 }} textAlign="justified" color="#707070">
          within a short period after this or that time, event, etc.
        </Text>

        <View style={{ marginTop: 24 }}>
          <TouchableOpacity onPress={router.back.bind(null)}>
            <Text
              style={{ maxWidth: 380, textDecorationLine: "underline" }}
              textAlign="justified"
              color="#707070"
            >
              Go back
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
