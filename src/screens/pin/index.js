import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { useState, useRef } from "react";
import MapView from "react-native-maps";
import reverseGeocode from "../../services/api/reverseGeocoding";
import { Image } from "expo-image";

export default function Pin() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const mapRef = useRef(null);
  const [center, setCenter] = useState({
    latitude: params.latitude,
    longitude: params.longitude,
  });

  async function handleConfirm() {
    const redirectSource = params.redirectSource;

    // query reverse geocoding API
    const result = await reverseGeocode(
      `${center.latitude},${center.longitude}`
    );

    if (result.data.status === "OK") {
      if (result?.data?.results?.[0]) {
        const data = result?.data?.results?.[0];
        const placeId = data?.place_id;
        const address = data?.formatted_address;

        router.back();
        router.setParams({
          // first.ChIJETKun6zAlzMRxwiz-19C__Z.latitude
          [`${redirectSource}.${placeId}.latitude`]: center?.latitude,
          [`${redirectSource}.${placeId}.longitude`]: center?.longitude,
          [`${redirectSource}.placeId`]: placeId,
          [`${redirectSource}.address`]: address,
        });
      }
    }
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
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
              style={{ height: 56, width: 56 }}
              source="https://tbldsrfpqyqzrastjzoc.supabase.co/storage/v1/object/public/assets/pin.svg?t=2024-04-22T14%3A05%3A19.748Z"
              contentFit="cover"
            />
          </View>
          <MapView
            ref={mapRef}
            initialRegion={{
              latitude: params.latitude,
              longitude: params.longitude,
              latitudeDelta: 0.01084,
              longitudeDelta: 0.006443,
            }}
            onRegionChangeComplete={(region) => {
              setCenter({
                latitude: region.latitude,
                longitude: region.longitude,
              });
            }}
            style={styles.map}
          />
        </View>
        <TouchableOpacity onPress={handleConfirm} style={styles.primary}>
          <Text>Confirm</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "whitesmoke",
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
