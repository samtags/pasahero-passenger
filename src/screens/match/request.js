import { StackActions } from "@react-navigation/native";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import Text from "../../components/text";
import SafeAreaView from "../../components/safeAreaView";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import { useNavigation, useRouter } from "expo-router";
import Transit from "../../components/locations/Transit";
import { useMMKVString } from "react-native-mmkv";
import Cta from "../../components/cta";
import { SignedOut, SignedIn, useOAuth, useUser } from "@clerk/clerk-expo";
import EstimateItem from "../../components/estimate/Result";
import useGetEstimate from "../../services/queries/useGetEstimate";
import amount from "../../services/util/amount";
import { useState } from "react";
import findNearby from "../../services/api/findNearby";
import { useMutation } from "@tanstack/react-query";
import log from "../../services/log";
import Mapbox from "@rnmapbox/maps";

export default function List() {
  const router = useRouter();
  const navigation = useNavigation();
  const user = useUser();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const [selectedPlatforms, setSelectedPlatforms] = useState([
    "AngkasPassenger",
    "JoyRideMcTaxi",
    "MoveItMotoTaxi",
  ]);

  const [matchDraft] = useMMKVString("match.draft");
  const match = JSON.parse(matchDraft || "{}");
  const first = match?.first;
  const last = match?.last;

  const origin = `${match?.first?.latitude},${match?.first?.longitude}`;
  const destination = `${match?.last?.latitude},${match?.last?.longitude}`;

  const { data: angkasPassenger } = useGetEstimate("AngkasPassenger", origin, destination); // prettier-ignore
  const { data: joyRideMcTaxi } = useGetEstimate("JoyRideMcTaxi", origin, destination); // prettier-ignore
  const { data: moveItMotoTaxi } = useGetEstimate("MoveItMotoTaxi", origin, destination); // prettier-ignore

  const angkasMinFare = amount.format(angkasPassenger?.fare?.minFare || 0);
  const angkasMaxFare = Number(angkasPassenger?.fare?.maxFare || 0).toFixed(2);
  const angkasEstimatedFare = `${angkasMinFare} - ${angkasMaxFare}`;

  const joyRideMinFare = amount.format(joyRideMcTaxi?.fare?.minFare || 0);
  const joyRideMaxFare = Number(joyRideMcTaxi?.fare?.maxFare || 0).toFixed(2);
  const joyRideEstimatedFare = `${joyRideMinFare} - ${joyRideMaxFare}`;

  const moveItMinFare = amount.format(moveItMotoTaxi?.fare?.minFare || 0);
  const moveItMaxFare = Number(moveItMotoTaxi?.fare?.maxFare || 0).toFixed(2);
  const moveItEstimatedFare = `${moveItMinFare} - ${moveItMaxFare}`;

  let fares = [];

  if (selectedPlatforms.includes("AngkasPassenger")) {
    fares.push(angkasPassenger?.fare?.minFare, angkasPassenger?.fare?.maxFare);
  }

  if (selectedPlatforms.includes("JoyRideMcTaxi")) {
    fares.push(joyRideMcTaxi?.fare?.minFare, joyRideMcTaxi?.fare?.maxFare);
  }

  if (selectedPlatforms.includes("MoveItMotoTaxi")) {
    fares.push(moveItMotoTaxi?.fare?.minFare, moveItMotoTaxi?.fare?.maxFare);
  }

  fare = fares.filter(Boolean);

  let smallestFare = undefined;
  let largestFare = undefined;

  fares.forEach((num) => {
    if (smallestFare === undefined) {
      smallestFare = num;
    }

    if (largestFare === undefined) {
      largestFare = num;
    }

    if (num < smallestFare) {
      smallestFare = num;
    }

    if (num > largestFare) {
      largestFare = num;
    }
  });

  smallestFare = amount.format(smallestFare ?? 0);
  largestFare = Number(largestFare ?? 0).toFixed(2);

  const { isPending, mutateAsync } = useMutation({
    mutationFn: () =>
      findNearby({
        user_id: user?.user?.id,
        first_point: {
          latitude: first?.latitude,
          longitude: first?.longitude,
          short_address: first?.shortAddress,
          long_address: first?.longAddress,
        },
        last_point: {
          latitude: last?.latitude,
          longitude: last?.longitude,
          short_address: last?.shortAddress,
          long_address: last?.longAddress,
        },
      }),
  });

  const handleSignIn = async () => {
    try {
      const flow = await startOAuthFlow();

      const { createdSessionId, signUp, setActive } = flow;

      if (createdSessionId) {
        setActive({ session: createdSessionId });
      } else {
        setActive({ session: signUp.createdSessionId });
      }
    } catch (err) {
      log.error("OAuth error", { error: err });
    }
  };

  const handleOnSelect = (serviceName) => {
    if (selectedPlatforms.length === 1) {
      if (selectedPlatforms.includes(serviceName)) return;
    }

    if (selectedPlatforms.includes(serviceName)) {
      setSelectedPlatforms((prev) =>
        prev.filter((platform) => platform !== serviceName)
      );
    } else {
      setSelectedPlatforms((prev) => [...prev, serviceName]);
    }
  };

  const handleOnConfirm = () => {
    mutateAsync()
      .then((res) => {
        navigation.dispatch(StackActions.popToTop());
        router.navigate({
          pathname: `match/${res?.id}`,
        });
      })
      .catch((err) => {
        log.warn("Unable to proceed with request Ride", {
          error: err,
        });
      });
  };

  return (
    <>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={router.back} style={styles.backButton}>
              <Image
                style={styles.back}
                cachePolicy="memory-disk"
                source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FBack%20White.png?alt=media&token=10db1ea7-bf9a-403f-86f1-359e7eefa187"
              />
            </TouchableOpacity>
            <Text size={19} weight="bold" color="#fff">
              Request Ride
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
              <View style={{ height: 20, backgroundColor: "#6366F1" }} />
              <View style={{ position: "relative", flex: 1 }}>
                <View
                  style={{
                    marginTop: -20,
                    paddingHorizontal: 16,
                    gap: 8,
                    position: "absolute",
                    width: "100%",
                    zIndex: 1,
                  }}
                >
                  <View style={styles.row}>
                    <Transit
                      color="#1B1B1B"
                      indicatorSrc="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FOrigin.png?alt=media&token=7913bdfb-7b7f-41aa-aecb-433a275c92b8"
                    >
                      {match?.first?.shortAddress}
                    </Transit>
                  </View>
                  <View style={styles.row}>
                    <Transit color="#1B1B1B">
                      {match?.last?.shortAddress}
                    </Transit>
                  </View>
                </View>
                <View style={{ height: 280, backgroundColor: "#e5e7eb" }}>
                  <Mapbox.MapView
                    scaleBarEnabled={false}
                    style={styles.map}
                    styleURL="mapbox://styles/mapbox/light-v11"
                    logoPosition={{ top: -100, left: 0 }}
                    attributionEnabled={false}
                  >
                    <Mapbox.Camera
                      animationMode="none"
                      zoomLevel={15}
                      centerCoordinate={[first?.longitude, first?.latitude]}
                    />
                    <Mapbox.MarkerView
                      coordinate={[first?.longitude, first?.latitude]}
                    >
                      <Image
                        style={styles.marker}
                        cachePolicy="memory-disk"
                        source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FRequest%20Origin.png?alt=media&token=d7bfb9da-845a-4e48-96f5-b785b248bbfb"
                      />
                    </Mapbox.MarkerView>
                  </Mapbox.MapView>
                </View>
                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={{ paddingHorizontal: 16 }}
                >
                  <EstimateItem
                    platform="Angkas"
                    serviceName="Passenger"
                    highlightColor="#2BBEF1"
                    estimatedFare={angkasEstimatedFare}
                    serviceImage="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FAngkas.png?alt=media&token=6790cdbc-7cf7-456b-8e3e-2fed2c4193dc"
                    isSelected={selectedPlatforms.includes(angkasPassenger?.serviceName)} // prettier-ignore
                    onSelect={() => handleOnSelect(angkasPassenger?.serviceName)} // prettier-ignore
                  />
                  <EstimateItem
                    platform="JoyRide"
                    serviceName="MC Taxi"
                    highlightColor="#171ACB"
                    estimatedFare={joyRideEstimatedFare}
                    serviceImage="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FJoyRide%20McTaxi.png?alt=media&token=86c9d45f-aca9-458d-8079-0fc73cfd6ad7"
                    isSelected={selectedPlatforms.includes(joyRideMcTaxi?.serviceName)} // prettier-ignore
                    onSelect={() => handleOnSelect(joyRideMcTaxi?.serviceName)} // prettier-ignore
                  />

                  <EstimateItem
                    platform="Move it"
                    serviceName="Moto Taxi"
                    highlightColor="#9B282D"
                    estimatedFare={moveItEstimatedFare}
                    serviceImage="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FMove%20it.png?alt=media&token=b19e275e-820b-4b45-98d0-e54e56b48246"
                    isSelected={selectedPlatforms.includes(moveItMotoTaxi?.serviceName)} // prettier-ignore
                    onSelect={() => handleOnSelect(moveItMotoTaxi?.serviceName)} // prettier-ignore
                  />
                </ScrollView>
              </View>
            </View>
            <View style={{ padding: 16, gap: 12 }}>
              <Text textAlign="center" size={14} color="#707070">
                Estimated Fare
              </Text>
              <Text textAlign="center" size={34} weight="bold" color="#353579">
                {smallestFare} - {largestFare}
              </Text>
              <View style={{ paddingHorizontal: 24 }}>
                <Text textAlign="center" size={11} color="#707070">
                  This estimation is based on price regulated by LTFB. Estimated
                  fare may vary in the actual trip in the application you chose.
                </Text>
              </View>
              <SignedOut>
                <Cta onPress={handleSignIn} color="#6366F1">
                  Sign in to Continue
                </Cta>
              </SignedOut>
              <SignedIn>
                <Cta
                  disabled={isPending}
                  onPress={handleOnConfirm}
                  color={isPending ? "#B9BAF9" : "#6366F1"}
                >
                  Request a Ride
                </Cta>
              </SignedIn>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#6366F1",
  },
  container: {
    backgroundColor: "white",
    flex: 1,
  },
  header: {
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    position: "relative",
  },
  back: {
    width: 18,
    height: 14,
  },
  backButton: {
    position: "absolute",
    left: 0,
    padding: 16,
  },
  row: {
    flexDirection: "row",
  },
  map: {
    height: "100%",
    width: "100%",
    flex: 1,
  },
  marker: { width: 48, height: 48, marginBottom: 24 },
});
