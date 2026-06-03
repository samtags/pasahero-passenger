import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import { useState, useRef } from "react";
import { Image } from "expo-image";
import Mapbox from "@rnmapbox/maps";
import Text from "../../../src/components/text";
import Cta from "../../../src/components/cta";
import BackButton from "../../../src/components/back";
import { StatusBar } from "expo-status-bar";
import useReverseGeocoding from "../../../src/services/queries/useReverseGeocoding";
import useDelayedValue from "../../../src/services/hooks/useDelayedValue";
import { handleSetTransitLast } from "../../../src/screens/transit/search/last";
import { pin } from "../../../src/services/images/remote";
import PinLastLocation from "../../../src/screens/pin/last";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import PinProvider from "../../../src/screens/pin/component/Provider";

export default function Entry() {
  const isEnabled = useFeatureIsOn("enable-map-pin-enhancement", false);

  if (isEnabled) return <Next />;
  return <Pin />;
}

export function Next() {
  const params = useLocalSearchParams();

  const coordinates = {};
  if (params.latitude) coordinates.latitude = params.latitude;
  if (params.longitude) coordinates.longitude = params.longitude;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          // animation: "ios",
        }}
      />
      <StatusBar backgroundColor="white" />
      <PinProvider {...coordinates}>
        <PinLastLocation />
      </PinProvider>
    </>
  );
}

export function Pin() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const latitude = Number(params?.latitude || 0);
  const longitude = Number(params?.longitude || 0);

  const mapRef = useRef(null);

  const [center, setCenter] = useState(() => ({ latitude, longitude }));

  const [isDragging, setIsDragging] = useState(false);

  const coordinates = useDelayedValue(center, 750);

  const { data, isLoading } = useReverseGeocoding(
    coordinates.latitude,
    coordinates.longitude,
  );

  // Sort by street address first
  data?.sort((a) => (a.types.includes("street_address") ? -1 : 1));

  const active = data?.[0];

  const isDisabled = !isDragging || isLoading || !active;

  function handleConfirm() {
    handleSetTransitLast({
      latitude: active?.geometry?.location.lat,
      longitude: active?.geometry?.location.lng,
      shortAddress: active?.formatted_address,
      longAddress: active?.formatted_address,
    });
    router.replace("/match/request");
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
          // animation: "ios",
        }}
      />

      <StatusBar backgroundColor="white" />
      <BackButton />

      <View
        style={{
          flex: 1,
          position: "relative",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View style={styles.marker}>
          <Image
            style={{ height: 98, width: 98 }}
            source={pin}
            contentFit="contain"
          />
        </View>
        <Mapbox.MapView
          ref={mapRef}
          onCameraChanged={(e) => {
            const latitude = e.properties.center[1];
            const longitude = e.properties.center[0];

            setCenter({
              latitude,
              longitude,
            });
          }}
          style={styles.map}
          logoPosition={{ top: -100, left: 0 }}
          scaleBarEnabled={false}
          styleURL="mapbox://styles/mapbox/light-v11"
          // styleURL="mapbox://styles/mapbox/streets-v12"
          onRegionDidChange={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(false)}
        >
          <Mapbox.Camera
            animationMode="none"
            zoomLevel={16.75}
            centerCoordinate={[params.longitude, params.latitude]}
          />
        </Mapbox.MapView>

        <BottomSheet
          title={active?.formatted_address}
          subTitle={active?.formatted_address}
        />
      </View>
    </View>
  );
}

function BottomSheet({ title, subTitle }) {
  return (
    <View style={styles.bottomLayout}>
      <View style={{ gap: 8 }}>
        <Text numberOfLines={1} size={18} weight="900" color="#353579">
          {/* {!active && !isLoading && "Not found."} */}
          {title}
        </Text>
        <Text size={14} color="#707070">
          {/* {!active && !isLoading && "No address found. Please try to move the pin."} */}
          {subTitle}
        </Text>
      </View>
      <Cta
      // onPress={handleConfirm}
      // disabled={isDisabled}
      // color={isDisabled ? "#B9BAF9" : "#6366F1"}
      >
        Confirm
      </Cta>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomLayout: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "white",
    paddingHorizontal: 18,
    paddingTop: 32,
    paddingBottom: 18,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    gap: 24,
  },
  primary: {
    backgroundColor: "gainsboro",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flexShrink: 0,
  },
  map: {
    height: "100%",
    width: "100%",
    flex: 1,
    position: "relative",
  },
  pin: {
    backgroundColor: "gainsboro",
    height: 24,
    width: 24,
    borderRadius: 4,
  },
  marker: {
    position: "absolute",
    zIndex: 1,
    alignItems: "center",
    gap: 2,
  },
});
