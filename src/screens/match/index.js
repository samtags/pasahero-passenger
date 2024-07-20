import { StackActions } from "@react-navigation/native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import Const from "expo-constants";
import useGetCoordinates from "../../services/queries/useGetCoordinates";
import { useRef, useState } from "react";
import useOnUpdate from "../../services/hooks/useOnUpdate";
import Optional from "../../components/optional";
import { Image } from "expo-image";
import { useMutation } from "@tanstack/react-query";
import findNearby from "../../services/api/findNearby";
import { useUser } from "@clerk/clerk-expo";
import log from "../../services/log";
import useGetEstimate from "../../services/queries/useGetEstimate";
import generateRandomNumberFromTo from "../../services/util/random/generateNumberFromTo";
import { pinWhite } from "../../services/images/remote";

export default function Match() {
  const user = useUser();
  const router = useRouter();
  const navigation = useNavigation();
  const mapRef = useRef(null);

  const params = useLocalSearchParams();
  const [coords, setCoordinates] = useState([]);

  const firstPlaceId = params["first.placeId"];
  const firstLat = params["first.latitude"];
  const firstLng = params["first.longitude"];

  const lastPlaceId = params["last.placeId"];
  const lastLat = params["last.latitude"];
  const lastLng = params["last.longitude"];

  const { data: first } = useGetCoordinates(firstPlaceId, firstLat, firstLng);
  const { data: last } = useGetCoordinates(lastPlaceId, lastLat, lastLng);

  let origin = `${first?.latitude},${first?.longitude}`;
  let destination = `${last?.latitude},${last?.longitude}`;

  const { data: angkasPassenger } = useGetEstimate("AngkasPassenger", origin, destination); // prettier-ignore
  const { data: joyRideMcTaxi } = useGetEstimate("JoyRideMcTaxi", origin, destination); // prettier-ignore
  const { data: moveItMotoTaxi } = useGetEstimate("MoveItMotoTaxi", origin, destination); // prettier-ignore

  const { isPending, mutateAsync } = useMutation({
    mutationFn: () =>
      findNearby({
        user_id: user?.user?.id,
        first_point: {
          latitude: first?.latitude,
          longitude: first?.longitude,
          short_address: params["first.short_address"],
          long_address: params["first.address"],
        },
        last_point: {
          latitude: last?.latitude,
          longitude: last?.longitude,
          short_address: params["last.short_address"],
          long_address: params["last.address"],
        },
      }),
  });

  useOnUpdate(() => {
    if (coords.length) {
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: {
          top: 16,
          right: 50,
          bottom: 50,
          left: 50,
        },
      });
    }
  }, [coords]);

  const handleOnConfirm = () => {
    mutateAsync()
      .then((res) => {
        navigation.dispatch(StackActions.popToTop());
        router.navigate({
          pathname: `match/${res?.id}`,
        });
      })
      .catch((err) => {
        log.warn("🚀 ~ handleOnConfirm ~ err:", {
          error: err,
        });
      });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ width: "100%", height: 180, overflow: "hidden" }}>
          <MapView
            initialRegion={{
              latitude: first?.latitude || 0,
              longitude: first?.longitude || 0,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            toolbarEnabled={false}
            provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
            ref={mapRef}
            paddingAdjustmentBehavior="never"
            customMapStyle={mapStyle}
            style={{
              height: "120%",
              width: "100%",
            }}
          >
            {first && (
              <Marker identifier="first" coordinate={first}>
                <Image
                  style={{ height: 32, width: 32 }}
                  source={pinWhite}
                  contentFit="cover"
                />
              </Marker>
            )}
            {last && (
              <Marker identifier="last" coordinate={last}>
                <Image
                  style={{ height: 56, width: 56 }}
                  source={pinWhite}
                  contentFit="cover"
                />
              </Marker>
            )}

            <Optional condition={first && last}>
              <MapViewDirections
                origin={first}
                destination={last}
                apikey={process.env.EXPO_PUBLIC_GOOGLE_API_KEY}
                strokeWidth={5}
                strokeColor="gray"
                onReady={(result) => setCoordinates(result.coordinates)}
              />
            </Optional>
          </MapView>
        </View>
        <View style={{ flex: 1, paddingBottom: 16 }}>
          <View style={{ gap: 8, padding: 16 }}>
            <Text>{generateRandomNumberFromTo(2, 7)} Drivers Nearby</Text>

            <Text>{params["first.address"]}</Text>
            <Text>{params["last.address"]}</Text>
            <View style={{ marginTop: 12, gap: 8 }}>
              {angkasPassenger && (
                <ServiceCard
                  serviceName="Angkas Passenger"
                  minFare={angkasPassenger?.fare.minFare}
                  maxFare={angkasPassenger?.fare.maxFare}
                  currency={angkasPassenger?.fare.currency}
                  onPress={() => {
                    console.log("AngkasPassenger");
                  }}
                />
              )}

              {joyRideMcTaxi && (
                <ServiceCard
                  serviceName="JoyRide MC Taxi"
                  minFare={joyRideMcTaxi?.fare.minFare}
                  maxFare={joyRideMcTaxi?.fare.maxFare}
                  currency={joyRideMcTaxi?.fare.currency}
                  onPress={() => {
                    console.log("JoyRideMcTaxi");
                  }}
                />
              )}

              {moveItMotoTaxi && (
                <ServiceCard
                  serviceName="Move It MotoTaxi"
                  minFare={moveItMotoTaxi?.fare.minFare}
                  maxFare={moveItMotoTaxi?.fare.maxFare}
                  currency={moveItMotoTaxi?.fare.currency}
                  onPress={() => {
                    console.log("MoveItMotoTaxi");
                  }}
                />
              )}
            </View>
          </View>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            disabled={isPending}
            onPress={handleOnConfirm}
            style={styles.button}
          >
            {!isPending && <Text>Find Driver</Text>}
            {isPending && <ActivityIndicator />}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

export function ServiceCard({
  serviceName,
  minFare,
  maxFare,
  currency,
  onPress,
}) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{serviceName}</Text>
      <Text>
        {currency} {minFare} - {currency} {maxFare}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "whitesmoke",
  },
  button: {
    backgroundColor: "gainsboro",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flexShrink: 0,
  },
});

const mapStyle = [
  {
    elementType: "geometry",
    stylers: [
      {
        color: "#f5f5f5",
      },
    ],
  },
  {
    elementType: "labels.icon",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#616161",
      },
    ],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#f5f5f5",
      },
    ],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#bdbdbd",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [
      {
        color: "#eeeeee",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#757575",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [
      {
        color: "#e5e5e5",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9e9e9e",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [
      {
        color: "#ffffff",
      },
    ],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#757575",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [
      {
        color: "#dadada",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#616161",
      },
    ],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9e9e9e",
      },
    ],
  },
  {
    featureType: "transit.line",
    elementType: "geometry",
    stylers: [
      {
        color: "#e5e5e5",
      },
    ],
  },
  {
    featureType: "transit.station",
    elementType: "geometry",
    stylers: [
      {
        color: "#eeeeee",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [
      {
        color: "#c9c9c9",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9e9e9e",
      },
    ],
  },
];
