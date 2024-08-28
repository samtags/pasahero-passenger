import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import Mapbox from "@rnmapbox/maps";
import { pin } from "../../../services/images/remote";

export default function Map({
  onCameraChanged,
  onTouchStart,
  onRegionDidChange,
  coordinates,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.marker}>
        <Image style={styles.pin} source={pin} contentFit="contain" />
      </View>
      <Mapbox.MapView
        style={styles.map}
        scaleBarEnabled={false}
        logoPosition={{ top: -100, left: 0 }}
        attributionEnabled={false}
        onTouchStart={(e) => onTouchStart?.(e)}
        onCameraChanged={(e) => onCameraChanged?.(e)}
        onRegionDidChange={(e) => onRegionDidChange?.(e)}
        styleURL="mapbox://styles/mapbox/streets-v12"
      >
        <Mapbox.Camera
          animationMode="none"
          zoomLevel={16.75}
          centerCoordinate={coordinates}
        />
      </Mapbox.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  marker: {
    position: "absolute",
    zIndex: 1,
    alignItems: "center",
    gap: 2,
  },
  map: {
    height: "100%",
    width: "100%",
    flex: 1,
    position: "relative",
  },
  container: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  pin: { height: 98, width: 98 },
});
