import { useLocalSearchParams, useRouter } from "expo-router";
import { View, StyleSheet, Alert, ScrollView, Dimensions } from "react-native";
import Mapbox from "@rnmapbox/maps";
import useMatch from "../../services/supabase/realtime/useMatch";
import Optional from "../../components/optional";
import Text from "../../components/text";
import useOnUpdate from "../../services/hooks/useOnUpdate";
import { useRef, useState } from "react";
import { FlingGestureHandler, Directions } from "react-native-gesture-handler";
import { Image } from "expo-image";
import Cta from "../../components/cta";

export default function Match() {
  const router = useRouter();

  const params = useLocalSearchParams();
  const match = useMatch(params.id);
  console.log("🚀 ~ Match ~ match:", match);
  const [scrollEnabled, setScrollEnabled] = useState(false);
  const scrollRef = useRef();

  useOnUpdate(() => {
    if (match?.status === "DONE") {
      Alert.alert(
        "Trip completed",
        "You have now arrived in your destination."
      );

      router.navigate("/");
    }
  }, [match?.status]);

  const pointerEvents = scrollEnabled ? "auto" : "box-none";
  const isCoordinatesReady =
    match?.first_point?.longitude && match?.first_point?.latitude;

  return (
    <View style={styles.container}>
      <View style={styles.full}>
        <ScrollView
          ref={scrollRef}
          pagingEnabled
          horizontal={false}
          snapToAlignment="end"
          showsVerticalScrollIndicator={false}
          style={styles.absolute}
          pointerEvents={pointerEvents}
          contentContainerStyle={{ gap: 8, pointerEvents }}
          onMomentumScrollEnd={(e) => {
            if (e.nativeEvent.contentOffset.y <= 0) setScrollEnabled(false);
          }}
        >
          <View style={styles.preview}>
            <FlingGestureHandler
              direction={Directions.UP}
              onHandlerStateChange={() => {
                setScrollEnabled((prev) => {
                  if (prev === false) return true;
                  return prev;
                });
                scrollRef?.current?.scrollTo({ y: 50, animated: true });
              }}
            >
              <View style={styles.previewContent}>
                <Text size={28} weight="bold" color="#353579">
                  Searching
                </Text>
                <Text size={14} color="#707070">
                  Hold still we are will find the best match for you.
                </Text>
                <View style={styles.services}>
                  <View style={styles.serviceContainer}>
                    <Image
                      source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FJoyRide%20McTaxi.png?alt=media&token=86c9d45f-aca9-458d-8079-0fc73cfd6ad7"
                      cachePolicy="memory-disk"
                      style={styles.image}
                    />
                  </View>
                  <View style={styles.serviceContainer}>
                    <Image
                      source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FMove%20it.png?alt=media&token=b19e275e-820b-4b45-98d0-e54e56b48246"
                      cachePolicy="memory-disk"
                      style={styles.image}
                    />
                  </View>
                </View>
              </View>
            </FlingGestureHandler>
          </View>
          <View
            style={{
              backgroundColor: "white",
              paddingHorizontal: 16,
              paddingVertical: 32,
              gap: 16,
            }}
          >
            <View style={{ gap: 8 }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <Image
                  style={styles.indicator}
                  cachePolicy="memory-disk"
                  source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FOrigin.png?alt=media&token=7913bdfb-7b7f-41aa-aecb-433a275c92b8"
                />
                <Text weight="900" size={18} color="#1B1B1B">
                  {match?.first_point?.short_address}
                </Text>
              </View>
              <Text size={14} color="#707070">
                {match?.first_point?.long_address}
              </Text>
            </View>
            <View style={{ gap: 8 }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <Image
                  style={styles.indicator}
                  cachePolicy="memory-disk"
                  source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FDestination.png?alt=media&token=e92cc2d1-77c3-486f-9793-3c0827ca5aef"
                />
                <Text weight="900" size={18} color="#1B1B1B">
                  {match?.last_point?.short_address}
                </Text>
              </View>
              <Text size={14} color="#707070">
                {match?.last_point?.long_address}
              </Text>
            </View>
          </View>
          <View
            style={{
              backgroundColor: "white",
              paddingHorizontal: 16,
              paddingVertical: 32,
              gap: 16,
            }}
          >
            <View style={{ gap: 8 }}>
              <Text size={14} color="#707070">
                Service Charge
              </Text>
              <Text weight="bold" size={18} color="#1B1B1B">
                ₱5.00
              </Text>
            </View>
            <View style={{ gap: 8 }}>
              <Text size={14} color="#707070">
                Estimated Fare
              </Text>
              <Text weight="700" size={34} color="#353579">
                ₱ 50.00 - 60.00
              </Text>
            </View>
            <Text color="#707070" size={11}>
              This estimation is based on price regulated by LTFB. Estimated
              fare may vary in the actual trip in the application you chose.
            </Text>
            <Cta disabled color="#D1D5DB">
              Slide to cancel
            </Cta>
          </View>
        </ScrollView>
        <Mapbox.MapView
          scaleBarEnabled={false}
          style={styles.map}
          styleURL="mapbox://styles/mapbox/light-v11"
          logoPosition={{ top: -100, left: 0 }}
          attributionEnabled={false}
        >
          <Optional condition={isCoordinatesReady}>
            <Mapbox.Camera
              animationMode="none"
              zoomLevel={13.79}
              centerCoordinate={[
                match?.first_point?.longitude,
                match?.first_point?.latitude,
              ]}
            />
            <Mapbox.MarkerView
              coordinate={[
                match?.first_point?.longitude,
                match?.first_point?.latitude,
              ]}
            >
              <Image
                style={styles.marker}
                cachePolicy="memory-disk"
                source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FRequest%20Origin.png?alt=media&token=d7bfb9da-845a-4e48-96f5-b785b248bbfb"
              />
            </Mapbox.MarkerView>
          </Optional>
        </Mapbox.MapView>
      </View>
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
    zIndex: 2,
    height: "100%",
    width: "100%",
    gap: 16,
  },
  previewContent: {
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
  button: {
    backgroundColor: "gainsboro",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  preview: {
    paddingTop: Dimensions.get("window").height - 160,
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width,
  },
  services: {
    flexDirection: "row",
    marginTop: 24,
    gap: 8,
  },
  serviceContainer: {
    height: 24,
    width: 24,
    borderRadius: 24,
    overflow: "hidden",
  },
  image: {
    height: 24,
    width: 24,
  },
  marker: { width: 48, height: 48, marginBottom: 24 },
  indicator: { width: 12, height: 12 },
});
