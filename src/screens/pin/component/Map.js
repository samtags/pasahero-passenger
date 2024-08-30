import { View, StyleSheet, Dimensions } from "react-native";
import { Image } from "expo-image";
import Mapbox from "@rnmapbox/maps";
import { pin } from "../../../services/images/remote";
import { Context } from "./Provider";
import Optional from "../../../components/optional";
import { useContext } from "react";

export default function Map({
  onCameraChanged,
  onTouchStart,
  onRegionDidChange,
  coordinates,
}) {
  const { isKeyboardVisible } = useContext(Context);

  const { isPending } = coordinates;

  const containerOptionalStyles = {};

  if (isPending) {
    containerOptionalStyles.opacity = 0;
  }

  return (
    <View style={[styles.container, containerOptionalStyles]}>
      <Optional condition={isKeyboardVisible === false}>
        <View pointerEvents="none" style={styles.marker}>
          <Image style={styles.pin} source={pin} contentFit="contain" />
        </View>
      </Optional>
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
          zoomLevel={18}
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
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    zIndex: 0,
  },
  pin: { height: 98, width: 98 },
});
