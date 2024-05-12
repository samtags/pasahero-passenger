import { useMMKVString } from "react-native-mmkv";
import { Stack, useRouter } from "expo-router";
import { View, SafeAreaView, StyleSheet, TouchableOpacity } from "react-native";
import Text from "../../components/text";
import Mapbox from "@rnmapbox/maps";
import { Image } from "expo-image";

export default function Home() {
  const router = useRouter();
  const [loc] = useMMKVString("location.current");
  const location = JSON.parse(loc || "{}");

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={styles.full}>
        <View pointerEvents="box-none" style={styles.absolute}>
          <View style={styles.content}>
            <Text size={18} weight="bold" color="#757477">
              Hi,
            </Text>
            <Text size={28} weight="bold" color="#353579">
              Where are we going?
            </Text>
            <View style={{ marginTop: 16 }} />
            <TouchableOpacity>
              <View
                style={{
                  backgroundColor: "#F0F0F0",
                  paddingHorizontal: 16,
                  paddingVertical: 10.5,
                  flexDirection: "row",
                  borderRadius: 10,
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Image
                  style={{ width: 12, height: 12, marginTop: 4 }}
                  cachePolicy="memory-disk"
                  source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FDestination.png?alt=media&token=e92cc2d1-77c3-486f-9793-3c0827ca5aef"
                />
                <Text color="#B9B8BB">Going to?</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <Mapbox.MapView
          scaleBarEnabled={false}
          style={styles.map}
          styleURL="mapbox://styles/mapbox/light-v11"
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
});
