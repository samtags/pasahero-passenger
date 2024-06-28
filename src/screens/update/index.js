import { Platform, View } from "react-native";
import Text from "../../components/text";
import { Link, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useStringVariation } from "@launchdarkly/react-native-client-sdk";

export default function Update() {
  const googlePlayUrl = useStringVariation("phd-google-play-url", "");
  const appStoreUrl = useStringVariation("phd-app-store-url", "");

  let url = googlePlayUrl;

  if (Platform.OS === "ios") {
    url = appStoreUrl;
  }

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
          Update
        </Text>
        <Text style={{ maxWidth: 380 }} textAlign="justified" color="#707070">
          ˌəp-ˈdāt
        </Text>

        <View style={{ marginTop: 8 }} />

        <Text style={{ maxWidth: 380 }} textAlign="justified" color="#707070">
          to bring (a book, figures, or the like) up to date as by adding new
          information or making corrections
        </Text>

        <View style={{ marginTop: 24 }} />

        <Link href={url}>
          <Text
            style={{ maxWidth: 380, textDecorationLine: "underline" }}
            textAlign="justified"
            color="#707070"
          >
            Update now!
          </Text>
        </Link>
      </View>
    </>
  );
}
