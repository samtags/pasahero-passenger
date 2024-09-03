import { StackActions, CommonActions } from "@react-navigation/native";
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
import { useEffect, useRef, useState } from "react";
import findNearby from "../../services/api/findNearby";
import { useMutation } from "@tanstack/react-query";
import log from "../../services/log";
import Mapbox from "@rnmapbox/maps";
import { Skeleton } from "moti/skeleton";
import Optional from "../../components/optional";
import * as WebBrowser from "expo-web-browser";
import { useWarmUpBrowser } from "../../services/hooks/useWarmUpBrowser";
import useGetDirections from "../../services/hooks/useGetDirections";
import * as Polyline from "@mapbox/polyline";
import useOnUpdate from "../../services/hooks/useOnUpdate";
import useOnUpdateSnapshot from "../../services/hooks/useOnUpdateSnapshot";
import {
  angkasIcon,
  arrowLeftWhite,
  first as firstIcon,
  joyrideIcon,
  last as lastIcon,
  moveItIcon,
} from "../../services/images/remote";

WebBrowser.maybeCompleteAuthSession();
export default function List() {
  useWarmUpBrowser();

  const router = useRouter();
  const isFromAuth = useRef(false);
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

  const origin = `${first?.latitude},${first?.longitude}`;
  const destination = `${last?.latitude},${last?.longitude}`;

  const { data: directions } = useGetDirections(origin, destination);
  const route = directions?.routes?.[0];
  let coordinates = [];

  const [cameraConfig, setCameraConfig] = useState({
    zoomLevel: 14,
    centerCoordinate: [
      first?.longitude || DEFAULT_COORDINATES[0],
      first?.latitude || DEFAULT_COORDINATES[1],
    ],
    isMutated: false,
  });

  const { data: angkasPassenger, isLoading: isLoadingAngkas } = useGetEstimate("AngkasPassenger", origin, destination); // prettier-ignore
  const { data: joyRideMcTaxi, isLoading: isLoadingJoyRide } = useGetEstimate("JoyRideMcTaxi", origin, destination); // prettier-ignore
  const { data: moveItMotoTaxi, isLoading: isLoadingMoveIt } = useGetEstimate("MoveItMotoTaxi", origin, destination); // prettier-ignore

  const angkasMinFare = amount.format(angkasPassenger?.fare?.minFare || 0);
  const angkasMaxFare = Number(angkasPassenger?.fare?.maxFare || 0).toFixed(2);
  const angkasEstimatedFare = `${angkasMinFare} - ${angkasMaxFare}`;

  const joyRideMinFare = amount.format(joyRideMcTaxi?.fare?.minFare || 0);
  const joyRideMaxFare = Number(joyRideMcTaxi?.fare?.maxFare || 0).toFixed(2);
  const joyRideEstimatedFare = `${joyRideMinFare} - ${joyRideMaxFare}`;

  const moveItMinFare = amount.format(moveItMotoTaxi?.fare?.minFare || 0);
  const moveItMaxFare = Number(moveItMotoTaxi?.fare?.maxFare || 0).toFixed(2);
  const moveItEstimatedFare = `${moveItMinFare} - ${moveItMaxFare}`;

  /**
   * prevent stacking of same screen in the navigation stack
   * resulting in a back button loop to the same screen
   * this usually happens when the user came from pin location screen
   */
  useEffect(() => {
    const routes = navigation.getState().routes;

    let hasDuplicate = false;
    let tmp = new Set();
    const newRoutes = [];

    routes.forEach((route) => {
      if (tmp.has(route.name)) {
        hasDuplicate = true;
        return;
      }

      tmp.add(route.name);
      newRoutes.push(route);
    });

    if (hasDuplicate) {
      navigation.dispatch(
        CommonActions.reset({
          index: newRoutes.length - 1,
          routes: newRoutes,
        })
      );
    }
  }, []);

  useOnUpdate(() => {
    let boundingBox = undefined;
    let bounds = undefined;
    let animationMode = "none";

    if (coordinates?.length > 1) {
      boundingBox = calculateBoundingBox(coordinates);

      bounds = {
        ne: boundingBox?.[1],
        sw: boundingBox?.[0],
        paddingTop: 96, // padding + marker height
        paddingLeft: 48,
        paddingRight: 48,
        paddingBottom: 16,
      };

      animationMode = "flyTo";

      setTimeout(() => {
        setCameraConfig((prev) => {
          if (prev.isMutated === false) {
            return {
              bounds,
              animationMode,
            };
          }

          return prev;
        });
      }, 250);
    }
  }, [coordinates]);

  useOnUpdateSnapshot(
    (prev, curr) => {
      if (!prev.user?.user && curr.user?.user) {
        if (isFromAuth.current === true) {
          handleOnConfirm();
        }
      }
    },
    { user }
  );

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

  fares = fares.filter(Boolean);

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
        services: selectedPlatforms,
        estimatePreview: `${smallestFare} - ${largestFare}`,
      }),
  });

  const handleSignIn = async () => {
    try {
      isFromAuth.current = true;
      const flow = await startOAuthFlow();

      const { createdSessionId, signUp, setActive } = flow;

      if (createdSessionId) {
        setActive({ session: createdSessionId });
      } else {
        setActive({ session: signUp.createdSessionId });
      }
    } catch (err) {
      log.error("OAuth error", { error: err });
      isFromAuth.current = false;
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
    log.info('User tap "Request a Ride" button.', { actionType: "tap" });

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

  if (route) {
    const points = Polyline.decode(route.overview_polyline.points);
    coordinates = points.map((point) => ({
      latitude: point[0],
      longitude: point[1],
    }));
  }

  const disableSubmit = isPending || fares.length === 0;

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
                source={arrowLeftWhite}
              />
            </TouchableOpacity>
            <Text size={19} weight="bold" color="#fff">
              Request Ride
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
              <View style={{ height: 20, backgroundColor: "#23235F" }} />
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
                      onPress={() => {
                        router.navigate({
                          pathname: "/transit/search/first",
                          params: {
                            shortAddress: match?.first?.shortAddress,
                            latitude: match?.first?.latitude,
                            longitude: match?.first?.longitude,
                            isFromMatchRequest: 1,
                          },
                        });
                      }}
                      indicatorSrc="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FOrigin.png?alt=media&token=7913bdfb-7b7f-41aa-aecb-433a275c92b8"
                    >
                      {match?.first?.shortAddress}
                    </Transit>
                  </View>
                  <View style={styles.row}>
                    <Transit
                      onPress={() => {
                        router.navigate({
                          pathname: "/transit/search/last",
                          params: {
                            shortAddress: match?.last?.shortAddress,
                            latitude: match?.last?.latitude,
                            longitude: match?.last?.longitude,
                          },
                        });
                        // router.replace({
                        //   pathname: "/transit/search/last",
                        //   params: {
                        //     shortAddress: match?.last?.shortAddress,
                        //     latitude: match?.last?.latitude,
                        //     longitude: match?.last?.longitude,
                        //   },
                        // });
                      }}
                      color="#1B1B1B"
                    >
                      {match?.last?.shortAddress}
                    </Transit>
                  </View>
                </View>
                <View style={{ height: 280, backgroundColor: "#e5e7eb" }}>
                  <Mapbox.MapView
                    scaleBarEnabled={false}
                    style={styles.map}
                    styleURL="mapbox://styles/mapbox/light-v11"
                    // styleURL="mapbox://styles/mapbox/streets-v12"
                    logoPosition={{ top: -100, left: 0 }}
                    attributionEnabled={false}
                    // onDidFinishRenderingMap={() => console.log("Map ready")}
                  >
                    <Mapbox.Camera animationDuration={2000} {...cameraConfig} />
                    <Optional condition={coordinates?.length > 1}>
                      <Mapbox.ShapeSource
                        id="route"
                        shape={{
                          type: "Feature",
                          properties: {},
                          geometry: {
                            type: "LineString",
                            coordinates: coordinates.map((coords) => [
                              coords.longitude,
                              coords.latitude,
                            ]),
                          },
                        }}
                      >
                        <Mapbox.LineLayer
                          id="stroke"
                          style={{
                            lineColor: "#373BF4",
                            lineWidth: 6.5,
                            lineCap: "round",
                            lineJoin: "round",
                          }}
                        />
                        <Mapbox.LineLayer
                          id="routeLayer"
                          style={{
                            lineColor: "#6366F1",
                            lineWidth: 3,
                            lineCap: "round",
                            lineJoin: "round",
                          }}
                        />
                      </Mapbox.ShapeSource>
                    </Optional>
                    <Optional condition={first?.longitude && first?.latitude}>
                      <Mapbox.MarkerView
                        id="from"
                        coordinate={[first?.longitude, first?.latitude]}
                      >
                        <Image
                          style={styles.marker}
                          cachePolicy="memory-disk"
                          source={firstIcon}
                        />
                      </Mapbox.MarkerView>
                    </Optional>

                    <Optional condition={last?.longitude && last?.latitude}>
                      <Mapbox.MarkerView
                        id="to"
                        coordinate={[last?.longitude, last?.latitude]}
                      >
                        <Image
                          style={styles.marker}
                          cachePolicy="memory-disk"
                          source={lastIcon}
                        />
                      </Mapbox.MarkerView>
                    </Optional>
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
                    isLoading={isLoadingAngkas}
                    estimatedFare={angkasEstimatedFare}
                    serviceImage={angkasIcon}
                    isSelected={selectedPlatforms.includes(angkasPassenger?.serviceName)} // prettier-ignore
                    onSelect={() => handleOnSelect(angkasPassenger?.serviceName)} // prettier-ignore
                  />
                  <EstimateItem
                    platform="JoyRide"
                    serviceName="MC Taxi"
                    highlightColor="#171ACB"
                    isLoading={isLoadingJoyRide}
                    estimatedFare={joyRideEstimatedFare}
                    serviceImage={joyrideIcon}
                    isSelected={selectedPlatforms.includes(joyRideMcTaxi?.serviceName)} // prettier-ignore
                    onSelect={() => handleOnSelect(joyRideMcTaxi?.serviceName)} // prettier-ignore
                  />

                  <EstimateItem
                    platform="Move it"
                    serviceName="Moto Taxi"
                    highlightColor="#9B282D"
                    isLoading={isLoadingMoveIt}
                    estimatedFare={moveItEstimatedFare}
                    serviceImage={moveItIcon}
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
              <Optional condition={fares.length === 0}>
                <View style={{ alignItems: "center" }}>
                  <Skeleton width={180} height={34} colorMode="light" />
                </View>
              </Optional>

              <Optional condition={fares.length > 0}>
                <Text
                  textAlign="center"
                  size={34}
                  weight="bold"
                  color="#353579"
                >
                  {smallestFare} - {largestFare}
                </Text>
              </Optional>

              <View style={{ paddingHorizontal: 24 }}>
                <Text textAlign="center" size={11} color="#707070">
                  This estimation is based on price regulated by LTFB. Estimated
                  fare may vary in the actual trip in the application you chose.
                </Text>
              </View>
              <SignedOut>
                <Cta
                  onPress={handleSignIn}
                  disabled={disableSubmit}
                  color={disableSubmit ? "#B9BAF9" : "#6366F1"}
                >
                  Sign in to Continue
                </Cta>
              </SignedOut>
              <SignedIn>
                <Cta
                  onPress={handleOnConfirm}
                  disabled={disableSubmit}
                  color={disableSubmit ? "#B9BAF9" : "#6366F1"}
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

const DEFAULT_COORDINATES = [121.0003445, 14.5431078];

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#23235F",
  },
  container: {
    backgroundColor: "white",
    flex: 1,
  },
  header: {
    backgroundColor: "#23235F",
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
  marker: { width: 38, height: 38, marginBottom: 24 },
  destinationMarker: { width: 56, height: 56, marginBottom: 24 },
});

function calculateBoundingBox(coordinates) {
  let minLat, minLon, maxLat, maxLon;

  coordinates.forEach((point) => {
    const { latitude, longitude } = point;

    if (minLat === undefined || latitude < minLat) {
      minLat = latitude;
    }

    if (minLon === undefined || longitude < minLon) {
      minLon = longitude;
    }

    if (maxLat === undefined || latitude > maxLat) {
      maxLat = latitude;
    }

    if (maxLon === undefined || longitude > maxLon) {
      maxLon = longitude;
    }
  });

  return [
    [minLon, minLat],
    [maxLon, maxLat],
  ];
}
