import { SafeAreaView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import Text from "../../../components/text";
import Transit from "../../../components/locations/Transit";
import Cta from "../../../components/cta";
import { useMMKVString } from "react-native-mmkv";
import Mapbox from "@rnmapbox/maps";
import log from "../../../services/log";
import storage from "../../../services/storage";

export default function TransitSearchFirstScreen() {
  const [loc] = useMMKVString("location.current");
  const location = JSON.parse(loc || "{}");

  const router = useRouter();

  function handleConfirm() {
    handleSetTransitFirst({
      latitude: location.latitude,
      longitude: location.longitude,
      shortAddress: location.shortAddress,
      longAddress: location.longAddress,
    });

    router.replace("/match/request");
  }

  function handleChange() {
    router.navigate({
      pathname: "/transit/search/first",
      params: {},
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heading}>
        <Transit
          onPress={handleChange}
          indicatorSrc="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FOrigin.png?alt=media&token=7913bdfb-7b7f-41aa-aecb-433a275c92b8"
          color="#1B1B1B"
        >
          {location.shortAddress}
        </Transit>
        <TouchableOpacity style={styles.current}>
          <Image
            style={styles.targetIcon}
            cachePolicy="memory-disk"
            source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FTarget.png?alt=media&token=d6c31afa-5308-43e8-a8cd-291cb7316009"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.full}>
        <View style={styles.mapContainer}>
          <Mapbox.MapView
            scaleBarEnabled={false}
            style={styles.map}
            styleURL="mapbox://styles/mapbox/streets-v12"
            // styleURL="mapbox://styles/mapbox/light-v11"
            logoPosition={{ top: -100, left: 0 }}
            attributionEnabled={false}
          >
            <Mapbox.Camera
              animationMode="none"
              zoomLevel={13.79}
              centerCoordinate={[location.longitude, location.latitude]}
            />
            <Mapbox.MarkerView
              coordinate={[location?.longitude, location?.latitude]}
            >
              <Image
                style={styles.marker}
                cachePolicy="memory-disk"
                source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FRequest%20Origin.png?alt=media&token=d7bfb9da-845a-4e48-96f5-b785b248bbfb"
              />
            </Mapbox.MarkerView>
          </Mapbox.MapView>
        </View>
        <View style={[styles.full, styles.spacer]}>
          <Text color="#707070">{location.longAddress}</Text>
        </View>
        <View style={styles.spacer}>
          <Cta onPress={handleConfirm} color="#6366F1">
            Confirm
          </Cta>
        </View>
      </View>
    </SafeAreaView>
  );
}

function handleSetTransitFirst({
  latitude,
  longitude,
  shortAddress,
  longAddress,
}) {
  let draft = {};

  try {
    const _matchDraft = storage.getString("match.draft");
    log.debug("Got match.draft", { data: _matchDraft });
    draft = JSON.parse(_matchDraft);
  } catch {
    log.warn("Failed to parse match.draft in last transit search.");
  }

  draft.first = { latitude, longitude, shortAddress, longAddress };

  storage.set("match.draft", JSON.stringify(draft));
  log.debug("Updated match.draft", {draft, latitude, longitude, shortAddress, longAddress}) // prettier-ignore
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    position: "relative",
  },
  heading: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 16,
    position: "absolute",
    zIndex: 1,
  },
  map: {
    height: "100%",
    width: "100%",
    flex: 1,
  },
  current: {
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 12,
  },
  targetIcon: { width: 24, height: 24 },
  mapContainer: { height: 280, backgroundColor: "#d1d5db" },
  full: {
    flex: 1,
  },
  spacer: {
    padding: 16,
  },
  marker: { width: 48, height: 48, marginBottom: 24 },
});
