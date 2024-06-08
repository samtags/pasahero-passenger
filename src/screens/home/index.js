import { useMMKVString } from "react-native-mmkv";
import { Stack, useRouter } from "expo-router";
import { View, SafeAreaView, StyleSheet, TouchableOpacity } from "react-native";
import Text from "../../components/text";
import Mapbox from "@rnmapbox/maps";
import Transit from "../../components/locations/Transit";
import log from "../../services/log";
import storage from "../../services/storage";
import { Image } from "expo-image";
import { useUser } from "@clerk/clerk-expo";
import useIncomingCall from "../../services/hooks/useIncomingCall";

export default function Home() {
  const user = useUser();
  const router = useRouter();
  const [loc] = useMMKVString("location.current");
  const location = JSON.parse(loc || "{}");

  const handleOnPressWhereTo = () => {
    handleInitializeDraft();
    router.navigate("/transit/search/last");
  };

  useIncomingCall(user?.user?.id);

  let greeting = "Hi,";

  if (user?.user?.firstName) {
    greeting = `Hi ${user?.user?.firstName}!`;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.full}>
        <View pointerEvents="box-none" style={styles.absolute}>
          <View style={styles.content}>
            <Text size={18} weight="bold" color="#757477">
              {greeting}
            </Text>
            <Text size={28} weight="bold" color="#353579">
              Where are we going?
            </Text>
            <View style={styles.heading}>
              <Transit onPress={handleOnPressWhereTo}>Going to?</Transit>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={router.navigate.bind(null, "/account")}
          style={styles.accountIcon}
        >
          <Image
            style={{ width: 44, height: 44 }}
            cachePolicy="memory-disk"
            source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FUser.png?alt=media&token=88972e31-48ef-4dc4-bc63-2eca23074831"
          />
        </TouchableOpacity>

        <Mapbox.MapView
          scaleBarEnabled={false}
          style={styles.map}
          styleURL="mapbox://styles/mapbox/navigation-day-v1"
          logoPosition={{ top: -100, left: 0 }}
          attributionEnabled={false}
        >
          <Mapbox.Camera
            animationMode="none"
            zoomLevel={13.79}
            centerCoordinate={[location.longitude, location.latitude]}
          />
        </Mapbox.MapView>
      </SafeAreaView>
    </View>
  );
}

function handleInitializeDraft() {
  const currentLocation = storage.getString("location.current");
  const location = JSON.parse(currentLocation);

  const draft = {
    first: {
      latitude: location.latitude,
      longitude: location.longitude,
      shortAddress: location.shortAddress,
      longAddress: location.longAddress,
    },
    last: {},
  };

  log.debug("User initialized draft", { ["match.draft"]: draft });
  storage.set("match.draft", JSON.stringify(draft));
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  full: {
    flex: 1,
    position: "relative",
  },
  absolute: {
    position: "absolute",
    zIndex: 1,
    height: "100%",
    width: "100%",
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: "white",
    paddingHorizontal: 18,
    paddingVertical: 32,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
  },
  map: {
    height: "100%",
    width: "100%",
    flex: 1,
  },
  heading: {
    flexDirection: "row",
    marginTop: 16,
  },
  accountIcon: {
    position: "absolute",
    zIndex: 1,
    right: 0,
    padding: 16,
    top: 16,
  },
});
