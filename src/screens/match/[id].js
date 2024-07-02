import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import Mapbox from "@rnmapbox/maps";
import useMatch from "../../services/supabase/realtime/useMatch";
import Optional from "../../components/optional";
import Text from "../../components/text";
import { useEffect, useRef, useState } from "react";
import { Image } from "expo-image";
import Cta from "../../components/cta";
import Preview from "./components/Preview";
import useOnUpdate from "../../services/hooks/useOnUpdate";
import BackButton from "../../components/back";
import { useMMKVString } from "react-native-mmkv";
import { useBoolVariation } from "@launchdarkly/react-native-client-sdk";
import cancelMatchRequest from "../../services/api/cancelMatchRequest";
import { useMutation } from "@tanstack/react-query";
import useGetDriverProfile from "../../services/queries/useGetDriverProfile";
import { Skeleton } from "moti/skeleton";
import { format } from "../../services/util/amount";
import LottieView from "lottie-react-native";
import useNearbyDrivers from "../../services/hooks/useNearbyDrivers";
import calculateBoundingBox from "../../services/util/map/calculateBoundingBox";
import useOnTheWayRoute from "../../services/hooks/useOnTheWayRoute";
import storage from "../../services/storage";
import log from "../../services/log";
import findNearby from "../../services/api/findNearby";
import { useUser } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import getColorByPlatform from "../../services/util/colors/getColorByPlatform";
import getStrokeColorByPlatform from "../../services/util/colors/getStokeColorByPlatform";
import useDriverToPickUpRouteProcedure, {
  handleGetDistance,
} from "../../services/hooks/useDriverToPickUpRouteProcedure";
import useDriverToDropoffRouteProcedure from "../../services/hooks/useDriverToDropoffRouteProcedure";
import completeMatch from "../../services/api/completeMatch";
import useOnAppFocus from "../../services/hooks/useFocus";

const defaultLocation = {
  latitude: 14.5535991,
  longitude: 121.0106671,
};

export default function Match() {
  const scrollRef = useRef();

  const { user } = useUser();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { match, refetch } = useMatch(params.id);
  const [showInstruction, setShowInstruction] = useState(false);
  const [showCancelationPrompt, setShowCancelationPrompt] = useState(false);

  // refetch the match data when the app is in focus
  // to handle websocket reconnection esp when the app is in background for a long time
  useOnAppFocus(refetch);

  const {
    coordinates: driverAssignedCoordinates,
    handleStart: handleStartAssignedRoute,
    isPending: isAssignedRoutePending,
    isStarted: isAssignedRouteStarted,
    handleStop: handleStopAssignedRoute,
    reset: handleResetAssignedRoute,
    eta: assignedEta,
  } = useDriverToPickUpRouteProcedure({ match_id: params.id });

  const {
    coordinates: driverOnTheWayCoordinates,
    handleStart: handleStartOnTheWayRoute,
    isStarted: isOnTheWayRouteStarted,
    handleStop: handleStopOnTheWayRoute,
    eta: onTheWayEta,
  } = useDriverToDropoffRouteProcedure({ match_id: params.id });

  const [screen, setScreen] = useState("PENDING"); // PENDING, REQUESTED, FOUND, ARRIVED, STARTED, DONE

  const [isMapInitialized, setIsMapInitialized] = useState(false);

  const { isPending: isCanceling, mutateAsync: handleCancel } = useMutation({
    mutationFn: () => cancelMatchRequest({ id: match?.id }),
    onSuccess: () => router.replace("/"),
  });

  const [matchDraft] = useMMKVString("match.draft");
  const draft = JSON.parse(matchDraft ?? "{}");

  const initialCoordinates = [
    match?.first_point?.longitude ?? draft?.first?.longitude,
    match?.first_point?.latitude ?? draft?.first?.latitude,
  ];

  const [scrollEnabled, setScrollEnabled] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const pointerEvents = scrollEnabled ? "auto" : "box-none";
  const isCoordinatesReady = Boolean(
    match?.first_point?.longitude && match?.first_point?.latitude
  );

  const {
    nearbyDriverIds,
    handleStop: handleStopWatchingNearbyDrivers,
    handleStart: handleWatchNearbyDrivers,
  } = useNearbyDrivers({
    payload: {
      latitude: match?.first_point?.latitude ?? draft?.first?.latitude,
      longitude: match?.first_point?.longitude ?? draft?.first?.longitude,
    },
    startOnMount: false,
  });

  function initializeMap() {
    if (isMapInitialized) return;
    setIsMapInitialized(true);
  }

  function handleGoToMessages() {
    router.navigate({
      pathname: `/messaging/${match?.id}`,
      params: {
        match_id: match?.id,
        driver_id: match?.driver_id,
      },
    });
  }

  function handleCallDriver() {
    router.navigate({
      pathname: "/call/dial",
      params: {
        roomId: match?.driver_id,
      },
    });
  }

  function onHandlerStateChange() {
    setScrollEnabled((prev) => {
      if (prev === false) return true;
      return prev;
    });
    // scrollRef?.current?.scrollTo({ y: 50, animated: true });
  }

  function handleOnPressCancel() {
    scrollRef?.current?.scrollTo({ y: 0, animated: true });
    setScrollEnabled(false);
    handleCancel();
  }

  function handleSubmitFeedback(feedback) {
    // todo: do something with the feedback
    console.log(feedback);
    setShowFeedback(false);

    router.replace("/");
  }

  function highlightPreview() {
    scrollRef?.current?.scrollTo({ y: 0, animated: true });
    setScrollEnabled(false);
  }

  async function handleCreateTrip(attemp = 0) {
    if (attemp > 2) {
      log.warn("Unable to create trip after 3 attempts");
      Alert.alert("Unable to find driver", "Please try again later.", [
        {
          text: "OK",
          onPress: () => router.replace("/"),
        },
      ]);
      throw new Error(500);
    }

    log.debug(`[${attemp}] Creating trip`, { match });
    let error;

    const createTripResponse = await findNearby({
      user_id: user?.id,
      first_point: match.first_point,
      last_point: match.last_point,
      services: match.services,
      estimatePreview: match.estimatePreview,
    }).catch(() => {
      error = true;
    });

    if (error) {
      log.warn(`[${attemp}] Failed to create trip`, { match });
      return await handleCreateTrip(attemp + 1);
    }

    return createTripResponse;
  }

  async function handleRecreateTrip() {
    const newMatch = await handleCreateTrip();
    log.debug("Redirecting to the new match", { newMatch });
    router.setParams({ id: newMatch.id });
  }

  function handleConfirmFromCancelationPrompt() {
    handleRecreateTrip();
    handleResetAssignedRoute();
    setScreen("PENDING");
    setShowCancelationPrompt(false);
    // todo: recenter the map
  }

  function handleCancelFromCancelationPrompt() {
    router.replace("/");
  }

  useEffect(() => {
    return () => {
      handleStopAssignedRoute();
      handleStopOnTheWayRoute();
    };
  }, []);

  useOnUpdate(() => {
    if (match.id === params.id) {
      if (match?.status === "DRIVER_CANCELED") {
        scrollRef?.current?.scrollTo({ y: 0, animated: false });
        setShowCancelationPrompt(true);
      }
    }

    if (match?.status === "REQUESTED") {
      setScreen("REQUESTED");
      handleWatchNearbyDrivers();
    }

    if (match?.status === "FOUND") {
      if (isAssignedRouteStarted === false) {
        handleStopWatchingNearbyDrivers();
        handleStartAssignedRoute();
      }

      setScreen("FOUND");
      highlightPreview();
    } else {
      if (isAssignedRouteStarted) {
        handleStopAssignedRoute();
      }
    }

    if (match?.status === "ARRIVED") {
      setScreen("ARRIVED");
      highlightPreview();

      handleChangePickupReference(match?.last_point);
    }

    if (match?.status === "STARTED") {
      highlightPreview();
      setScreen("STARTED");

      if (isOnTheWayRouteStarted === false) {
        handleStartOnTheWayRoute();
      }
    }

    if (match?.status === "DONE") {
      highlightPreview();

      const timer = setTimeout(() => {
        setShowFeedback(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [match]);

  let driverAssignedCameraBounds, onTheWayCameraBounds;

  if (driverAssignedCoordinates.length > 0) {
    const boundingBox = calculateBoundingBox(driverAssignedCoordinates);

    // check for invalid value of bounding box
    const ne = boundingBox[1];
    const sw = boundingBox[0];
    const padding = 24;

    if (ne[0] && ne[1] && sw[0] && sw[1]) {
      driverAssignedCameraBounds = {
        ne,
        sw,
        paddingTop: padding,
        paddingLeft: 48,
        paddingRight: 48,
        paddingBottom: padding + 290, // add preview height
      };
    }
  }

  if (driverOnTheWayCoordinates.length > 0) {
    const boundingBox = calculateBoundingBox(driverOnTheWayCoordinates);

    // check for invalid value of bounding box
    const ne = boundingBox[1];
    const sw = boundingBox[0];
    const padding = 24;

    if (ne[0] && ne[1] && sw[0] && sw[1]) {
      onTheWayCameraBounds = {
        ne,
        sw,
        paddingTop: padding,
        paddingLeft: 32,
        paddingRight: 32,
        paddingBottom: padding + 215, // add preview height
      };
    }
  }

  let driverIcon = "https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2Fmotor-angkas.png?alt=media&token=f30489fe-1495-41ec-8160-f048df15b602"; // prettier-ignore
  if (match?.platform === "JoyRide") driverIcon = "https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2Fmotor-joyride.png?alt=media&token=26f5ab6b-dc4d-4870-bb29-b04ea2c21096"; // prettier-ignore
  if (match?.platform === "Move It") driverIcon = "https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2Fmotor-moveit.png?alt=media&token=adfb7d67-03bc-4213-b3cc-22270a331f91"; // prettier-ignore

  let driverArrivedDistance = 999;

  if (driverAssignedCoordinates[0] && driverAssignedCoordinates.at(-1)) {
    driverArrivedDistance = handleGetDistance(
      driverAssignedCoordinates[0],
      driverAssignedCoordinates.at(-1)
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.full}>
        <Optional condition={showFeedback}>
          <Feedback
            onClose={() => setShowFeedback(false)}
            onSubmit={(feedback) => handleSubmitFeedback(feedback)}
          />
        </Optional>
        <BackButton />
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
          <Optional condition={match?.status === "DONE"}>
            <DonePreview
              onHandlerStateChange={onHandlerStateChange}
              profile_id={match?.profile_id}
            />
          </Optional>

          <Optional condition={match?.status === "STARTED"}>
            <StartedPreview
              onHandlerStateChange={onHandlerStateChange}
              profile_id={match?.profile_id}
              eta={onTheWayEta}
              match_id={match?.id}
            />
          </Optional>

          <Optional condition={match?.status === "ARRIVED"}>
            <ArrivedPreview
              onHandlerStateChange={onHandlerStateChange}
              services={match?.services}
              onMessage={handleGoToMessages}
              onCall={handleCallDriver}
              onTransfer={() => {
                setShowInstruction(true);
                scrollRef?.current?.scrollTo({ y: 0, animated: true });
                setScrollEnabled(false);
              }}
              profile_id={match?.profile_id}
            />
          </Optional>

          <Optional condition={match?.status === "FOUND"}>
            <FoundPreview
              onHandlerStateChange={onHandlerStateChange}
              onMessage={handleGoToMessages}
              onCall={handleCallDriver}
              driver_id={match?.driver_id}
              eta={assignedEta}
              onTransfer={() => {
                setShowInstruction(true);
                scrollRef?.current?.scrollTo({ y: 0, animated: true });
                setScrollEnabled(false);
              }}
              profile_id={match?.profile_id}
            />
          </Optional>

          <Optional
            condition={
              match?.status === "REQUESTED" ||
              screen === "PENDING" ||
              match?.status === "DRIVER_CANCELED"
            }
          >
            <RequestedPreview
              onHandlerStateChange={onHandlerStateChange}
              services={match?.services}
            />
          </Optional>

          <Optional condition={Boolean(match)}>
            <TransitPoints
              showShareRide={["FOUND", "ARRIVED", "STARTED"].includes(match?.status)} // prettier-ignore
              onShareRide={() => router.navigate("/soon")}
              first_point={match?.first_point}
              last_point={match?.last_point}
            />

            <FareDetails
              estimatePreview={match?.estimatePreview}
              showCancelOption={["REQUESTED", "FOUND"].includes(match?.status)}
              serviceCharge={match?.service_charge}
              isCanceling={isCanceling}
              onCancel={handleOnPressCancel}
            />
          </Optional>
        </ScrollView>
        <Mapbox.MapView
          scaleBarEnabled={false}
          style={[styles.map, { opacity: isMapInitialized ? 1 : 0 }]}
          // styleURL="mapbox://styles/mapbox/streets-v12"
          // styleURL="mapbox://styles/mapbox/outdoors-v12"
          // styleURL="mapbox://styles/mapbox/light-v11"
          styleURL="mapbox://styles/mapbox/streets-v12"
          logoPosition={{ top: -100, left: 0 }}
          attributionEnabled={false}
          regionDidChangeDebounceTime={1000}
          onDidFinishLoadingStyle={initializeMap}
        >
          <Optional
            fallback={
              <Mapbox.Camera
                animationMode="none"
                zoomLevel={12.76}
                centerCoordinate={[
                  defaultLocation.longitude,
                  defaultLocation.latitude,
                ]}
              />
            }
            condition={isCoordinatesReady}
          >
            <Mapbox.Camera
              animationMode="none"
              zoomLevel={13.79}
              centerCoordinate={initialCoordinates}
            />
            <Optional condition={screen === "REQUESTED"}>
              <Mapbox.MarkerView
                coordinate={[
                  match?.first_point?.longitude,
                  match?.first_point?.latitude,
                ]}
              >
                <View
                  style={{
                    position: "absolute",
                    height: 220,
                    width: 220,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Image
                    style={styles.marker}
                    cachePolicy="memory-disk"
                    source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FFrom.png?alt=media&token=0d152a8f-e9c4-4014-8816-6a5dc5660290"
                  />
                </View>
                <LottieView
                  autoPlay
                  loop
                  style={{ width: 220, height: 220 }}
                  source={require("../../assets/json/pulse.json")}
                />
              </Mapbox.MarkerView>

              {nearbyDriverIds.map((id) => (
                <DriverIcon key={id} id={id} />
              ))}
            </Optional>

            <Optional condition={screen === "FOUND"}>
              <Optional condition={isAssignedRoutePending === false}>
                <Optional condition={driverAssignedCoordinates?.length > 1}>
                  <Optional condition={driverAssignedCameraBounds}>
                    <Mapbox.Camera
                      animationMode="flyTo"
                      bounds={driverAssignedCameraBounds}
                    />
                  </Optional>

                  <Optional condition={driverArrivedDistance > 0.3}>
                    <Mapbox.ShapeSource
                      id="route"
                      shape={{
                        type: "Feature",
                        properties: {},
                        geometry: {
                          type: "LineString",
                          coordinates: driverAssignedCoordinates?.map(
                            (coords) => [coords.longitude, coords.latitude]
                          ),
                        },
                      }}
                    >
                      <Mapbox.LineLayer
                        id="stroke"
                        style={{
                          lineColor: getStrokeColorByPlatform(match?.platform),
                          lineWidth: 6.5,
                          lineCap: "round",
                          lineJoin: "round",
                        }}
                      />
                      <Mapbox.LineLayer
                        id="routeLayer"
                        style={{
                          lineColor: getColorByPlatform(match?.platform),
                          lineWidth: 3,
                          lineCap: "round",
                          lineJoin: "round",
                        }}
                      />
                    </Mapbox.ShapeSource>
                  </Optional>
                </Optional>
              </Optional>

              {(() => {
                const coordinates = driverAssignedCoordinates?.[0];

                if (coordinates?.longitude && coordinates?.latitude) {
                  return (
                    <Mapbox.MarkerView
                      id="FOUND_driver-marker"
                      coordinate={[coordinates.longitude, coordinates.latitude]}
                    >
                      <Image
                        cachePolicy="memory-disk"
                        style={{
                          width: 62,
                          height: 62,
                          transform: [{ rotate: `${coordinates?.heading || 0}deg` }], // prettier-ignore
                        }}
                        source={driverIcon}
                      />
                    </Mapbox.MarkerView>
                  );
                }

                return null;
              })()}

              {(() => {
                const coordinates =
                  driverAssignedCoordinates?.[
                    driverAssignedCoordinates?.length - 1
                  ];

                if (coordinates?.longitude && coordinates?.latitude) {
                  return (
                    <Mapbox.MarkerView
                      id="FOUND_pickup-marker"
                      coordinate={[coordinates.longitude, coordinates.latitude]}
                    >
                      <Image
                        style={[styles.marker]}
                        cachePolicy="memory-disk"
                        source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FFrom.png?alt=media&token=0d152a8f-e9c4-4014-8816-6a5dc5660290"
                      />
                    </Mapbox.MarkerView>
                  );
                }

                return null;
              })()}
            </Optional>

            <Optional condition={screen === "ARRIVED"}>
              {(() => {
                const coordinates = driverAssignedCoordinates?.[0];

                if (coordinates?.longitude && coordinates?.latitude) {
                  return (
                    <>
                      <Mapbox.Camera
                        animationMode="flyTo"
                        zoomLevel={17}
                        centerCoordinate={[
                          coordinates?.longitude,
                          coordinates?.latitude,
                        ]}
                      />
                      <Mapbox.MarkerView
                        id="FOUND_driver-marker"
                        coordinate={[
                          coordinates.longitude,
                          coordinates.latitude,
                        ]}
                      >
                        <Image
                          cachePolicy="memory-disk"
                          style={{
                            width: 62,
                            height: 62,
                            transform: [{ rotate: `${coordinates?.heading || 0}deg` }], // prettier-ignore
                          }}
                          source={driverIcon}
                        />
                      </Mapbox.MarkerView>
                    </>
                  );
                }

                return null;
              })()}
            </Optional>

            <Optional condition={screen === "STARTED"}>
              <Optional condition={driverOnTheWayCoordinates?.length > 1}>
                <Optional condition={onTheWayCameraBounds}>
                  <Mapbox.Camera
                    animationMode="flyTo"
                    bounds={onTheWayCameraBounds}
                  />
                </Optional>

                <Mapbox.ShapeSource
                  id="route"
                  shape={{
                    type: "Feature",
                    properties: {},
                    geometry: {
                      type: "LineString",
                      coordinates: driverOnTheWayCoordinates?.map((coords) => [
                        coords.longitude,
                        coords.latitude,
                      ]),
                    },
                  }}
                >
                  <Mapbox.LineLayer
                    id="stroke"
                    style={{
                      lineColor: getStrokeColorByPlatform(match?.platform),
                      lineWidth: 6.5,
                      lineCap: "round",
                      lineJoin: "round",
                    }}
                  />
                  <Mapbox.LineLayer
                    id="routeLayer"
                    style={{
                      lineColor: getColorByPlatform(match?.platform),
                      lineWidth: 3,
                      lineCap: "round",
                      lineJoin: "round",
                    }}
                  />
                </Mapbox.ShapeSource>
              </Optional>

              {(() => {
                const coordinates = driverOnTheWayCoordinates?.[0];

                if (coordinates?.longitude && coordinates?.latitude) {
                  return (
                    <Mapbox.MarkerView
                      id="STARTED_driver-marker"
                      coordinate={[
                        coordinates?.longitude,
                        coordinates?.latitude,
                      ]}
                    >
                      <Image
                        cachePolicy="memory-disk"
                        style={{
                          width: 62,
                          height: 62,
                          transform: [{ rotate: `${coordinates?.heading || 0}deg` }], // prettier-ignore
                        }}
                        source={driverIcon}
                      />
                    </Mapbox.MarkerView>
                  );
                }

                return null;
              })()}

              {(() => {
                const coordinates =
                  driverOnTheWayCoordinates?.[
                    driverOnTheWayCoordinates?.length - 1
                  ];

                if (coordinates?.longitude && coordinates?.latitude) {
                  return (
                    <Mapbox.MarkerView
                      id="STATED_dropoff-marker"
                      coordinate={[coordinates.longitude, coordinates.latitude]}
                    >
                      <Image
                        style={[styles.marker]}
                        cachePolicy="memory-disk"
                        source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FTo1.png?alt=media&token=7cb56012-bedd-416d-a01e-2dedfcd862d2"
                      />
                    </Mapbox.MarkerView>
                  );
                }

                return null;
              })()}
            </Optional>
          </Optional>
        </Mapbox.MapView>
      </View>

      <Optional condition={showInstruction}>
        <View
          style={{
            position: "absolute",
            backgroundColor: "#00000029",
            height: "100%",
            width: "100%",
            zIndex: 4,
          }}
        >
          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            <View
              style={{
                backgroundColor: "white",
                paddingHorizontal: 18,
                paddingVertical: 32,
                borderTopLeftRadius: 34,
                borderTopRightRadius: 34,
              }}
            >
              <Text size={28} weight="bold" color="#353579">
                H'wag mag habal
              </Text>

              <View style={{ marginVertical: 30, gap: 12 }}>
                <Text size={18} weight="bold" color="#1B1B1B">
                  Paano ilipat ang biyahe sa {match?.platform || "[platform]"}?
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    if (Platform.OS === "android") {
                      if (match?.platform === "Angkas") router.navigate("/transfer-angkas"); // prettier-ignore
                      if (match?.platform === "JoyRide") router.navigate("/transfer-joyride"); // prettier-ignore
                      if (match?.platform === "Move It") router.navigate("/transfer-move-it"); // prettier-ignore
                    }
                  }}
                >
                  <Text size={14} color="#707070">
                    <Text
                      style={{ textDecorationLine: "underline" }}
                      size={14}
                      color="#707070"
                      weight="700"
                    >
                      Bisitahin ang pahinang ito{" "}
                    </Text>
                    upang tingnan kung paano ilipat ang biyahe sa{" "}
                    {match?.platform || "[platform]"}.
                  </Text>
                </TouchableOpacity>
              </View>

              <Cta
                onPress={() => setShowInstruction(false)}
                textColor="#D1D5DB"
                color="transparent"
              >
                Isara
              </Cta>
              <View style={{ marginBottom: 8 }} />
              <Cta
                onPress={() => {
                  if (Platform.OS === "android") {
                    if (match?.platform === "Angkas") Linking.openURL("https://play.google.com/store/apps/details?id=com.angkas.customer"); // prettier-ignore
                    if (match?.platform === "JoyRide") Linking.openURL("https://play.google.com/store/apps/details?id=com.joyride.rider&hl=en_US"); // prettier-ignore
                    if (match?.platform === "Move It") Linking.openURL("https://play.google.com/store/apps/details?id=com.moveit.app.customer"); // prettier-ignore
                  }

                  setShowInstruction(false);
                }}
                color={getColorByPlatform(match?.platform)}
              >
                Ilipat sa {match?.platform || "[App]"}
              </Cta>
            </View>
          </View>
        </View>
      </Optional>
      <Optional condition={showCancelationPrompt}>
        <CancelationPrompt
          onCancel={handleCancelFromCancelationPrompt}
          onProceed={handleConfirmFromCancelationPrompt}
          match={match}
        />
      </Optional>
    </View>
  );
}

/**
 *
 * @param {RequestedPreviewProps} props
 * @returns
 */
function RequestedPreview({
  onHandlerStateChange, //
  services = [],
}) {
  return (
    <Preview
      style={styles.previewContent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <GrayBar />
      <Text size={28} weight="bold" color="#353579">
        Looking for drivers
      </Text>
      <Text size={14} color="#707070">
        We are searching the best match for your request.
      </Text>
      <View style={styles.services}>
        <Optional condition={services?.includes("AngkasPassenger")}>
          <View style={styles.serviceContainer}>
            <Image
              source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FAngkas.png?alt=media&token=6790cdbc-7cf7-456b-8e3e-2fed2c4193dc"
              cachePolicy="memory-disk"
              style={styles.image}
            />
          </View>
        </Optional>
        <Optional condition={services?.includes("JoyRideMcTaxi")}>
          <View style={styles.serviceContainer}>
            <Image
              source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FJoyRide%20McTaxi.png?alt=media&token=86c9d45f-aca9-458d-8079-0fc73cfd6ad7"
              cachePolicy="memory-disk"
              style={styles.image}
            />
          </View>
        </Optional>
        <Optional condition={services?.includes("MoveItMotoTaxi")}>
          <View style={styles.serviceContainer}>
            <Image
              source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FMove%20it.png?alt=media&token=b19e275e-820b-4b45-98d0-e54e56b48246"
              cachePolicy="memory-disk"
              style={styles.image}
            />
          </View>
        </Optional>
      </View>
    </Preview>
  );
}

/**
 *
 * @param {FoundPreviewProps} props
 * @returns
 */
function FoundPreview({
  onHandlerStateChange,
  eta,
  onMessage,
  onCall,
  onTransfer,
  profile_id,
}) {
  const { data: profile, isLoading: isProfileLoading } = useGetDriverProfile(profile_id); // prettier-ignore

  const displayName = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim(); // prettier-ignore
  const {
    image_url,
    vehicle_model,
    vehicle_plate_number,
    platform,
    vehicle_make,
  } = profile ?? {};

  return (
    <Preview
      style={styles.previewContent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <GrayBar />
      <Text size={28} weight="bold" color="#353579">
        On the way
      </Text>
      <View style={styles.driverInfoSubTitle}>
        <Text size={14} color="#707070">
          Your
          <Text weight="bold" size={14} color={getColorByPlatform(platform)}>
            {" "}
            <Optional condition={isProfileLoading === false}>
              {`${platform} `}
            </Optional>
          </Text>
          driver is on the way!
        </Text>
        <Optional condition={Boolean(eta)}>
          <Text weight="bold" size={14} color={getColorByPlatform(platform)}>
            {eta}
          </Text>
        </Optional>
      </View>

      <DriverInfo
        image_url={image_url}
        model={vehicle_model}
        plate_number={vehicle_plate_number}
        display_name={displayName}
        onCall={onCall}
        onMessage={onMessage}
        isLoading={isProfileLoading}
        showCallOption
        showChatOption
        vehicle_make={vehicle_make}
      />

      {/* <Optional condition={platform}>
        <View style={{ paddingTop: 16, backgroundColor: "#FFF" }}>
          <Cta
            onPress={() => onTransfer?.()}
            color={getColorByPlatform(platform)}
          >
            Transfer to {platform}
          </Cta>
        </View>
      </Optional> */}
    </Preview>
  );
}

function ArrivedPreview({
  onHandlerStateChange,
  onMessage,
  onCall,
  onTransfer,
  profile_id,
}) {
  const { data: profile, isLoading: isProfileLoading } = useGetDriverProfile(profile_id); // prettier-ignore

  const displayName = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim(); // prettier-ignore
  const {
    image_url,
    vehicle_model,
    vehicle_plate_number,
    platform,
    vehicle_make,
  } = profile ?? {};

  return (
    <Preview
      style={styles.previewContent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <GrayBar />
      <PreviewTitle>Driver Arrived</PreviewTitle>

      <Text size={14} color="#707070">
        Your
        <Text weight="bold" size={14} color={getColorByPlatform(platform)}>
          {` ${platform ?? ""} `}
        </Text>
        driver arrived to the pickup location
      </Text>

      <DriverInfo
        image_url={image_url}
        model={vehicle_model}
        plate_number={vehicle_plate_number}
        display_name={displayName}
        onCall={onCall}
        onMessage={onMessage}
        isLoading={isProfileLoading}
        showCallOption
        showChatOption
        vehicle_make={vehicle_make}
      />

      <View style={{ paddingTop: 16, backgroundColor: "#FFF" }}>
        <Cta
          onPress={() => onTransfer?.()}
          color={getColorByPlatform(platform)}
        >
          Transfer to {platform || "[App]"}
        </Cta>
      </View>
    </Preview>
  );
}

function StartedPreview({ onHandlerStateChange, profile_id, eta, match_id }) {
  const { data: profile, isLoading: isProfileLoading } = useGetDriverProfile(profile_id); // prettier-ignore

  const displayName = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim(); // prettier-ignore
  const {
    image_url,
    vehicle_model,
    vehicle_plate_number,
    platform,
    vehicle_make,
  } = profile ?? {};

  const { isPending, mutate: handleArriveAtDestination } = useMutation({
    mutationFn: handleCompleteMatch,
  });

  async function handleCompleteMatch() {
    await completeMatch({ id: match_id });
  }

  return (
    <Preview
      style={styles.previewContent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <GrayBar />

      <PreviewTitle>On your way</PreviewTitle>

      <View style={styles.driverInfoSubTitle}>
        <Text size={14} color="#707070">
          Now heading to the destination.
        </Text>
        <Optional condition={Boolean(eta)}>
          <Text weight="bold" size={14} color={getColorByPlatform(platform)}>
            {eta}
          </Text>
        </Optional>
      </View>

      <DriverInfo
        image_url={image_url}
        model={vehicle_model}
        plate_number={vehicle_plate_number}
        display_name={displayName}
        isLoading={isProfileLoading}
        vehicle_make={vehicle_make}
      />

      <View style={{ paddingTop: 16, backgroundColor: "#FFF" }}>
        <Cta
          disabled={isPending}
          style={{ opacity: isPending ? 0.25 : 1 }}
          onPress={() => {
            // todo: add location validation. check if the location is near to the destination
            Alert.alert(
              "Confirm trip arrival",
              "Doing this will complete your the trip. Do you want to continue this action?",
              [
                { text: "Close", style: "default", onPress: () => {} },
                {
                  text: "Confirm",
                  style: "destructive",
                  onPress: handleArriveAtDestination,
                },
              ]
            );
          }}
          color={getColorByPlatform(platform)}
        >
          Arrived at Destination
        </Cta>
      </View>
    </Preview>
  );
}

function DonePreview({ onHandlerStateChange, profile_id }) {
  const { data: profile, isLoading: isProfileLoading } = useGetDriverProfile(profile_id); // prettier-ignore

  const displayName = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim(); // prettier-ignore
  const { image_url, vehicle_model, vehicle_plate_number, vehicle_make } =
    profile ?? {};

  return (
    <Preview
      style={styles.previewContent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <PreviewTitle>Arrived</PreviewTitle>

      <Text size={14} color="#707070">
        You have arrived to the destination.
      </Text>

      <DriverInfo
        image_url={image_url}
        model={vehicle_model}
        plate_number={vehicle_plate_number}
        display_name={displayName}
        isLoading={isProfileLoading}
        vehicle_make={vehicle_make}
      />
    </Preview>
  );
}

function PreviewTitle({ children }) {
  return (
    <Text size={28} weight="bold" color="#353579">
      {children}
    </Text>
  );
}

function DriverInfo({
  image_url,
  model,
  plate_number,
  display_name,
  isLoading,
  onMessage,
  onCall,
  showCallOption,
  showChatOption,
  vehicle_make,
}) {
  let plateNumber;

  if (plate_number) plateNumber = `(${plate_number})`;

  return (
    <View style={styles.driverInfoContainer}>
      <View style={styles.driverInfoRow}>
        <View style={styles.driverDetailsRow}>
          <View style={styles.driverImageContainer}>
            <Optional condition={isLoading === false}>
              <Image
                style={styles.driverImage}
                source={image_url}
                cachePolicy="memory-disk"
              />
            </Optional>
          </View>
          <View style={{ gap: 4 }}>
            <Optional condition={isLoading}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Skeleton height={14} width={50} colorMode="light" />
                <Skeleton height={14} width={75} colorMode="light" />
              </View>
              <Skeleton height={10} width={75} colorMode="light" />
            </Optional>
            <Optional condition={isLoading === false}>
              <Text color="#363F59" size={18} weight="900">
                {`${vehicle_make ?? ""} ${model ?? ""}`.trim()}
              </Text>
              <Text size={14} weight="bold" color="#707070">
                {display_name} {plateNumber}
              </Text>
            </Optional>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 7 }}>
          <Optional condition={showChatOption}>
            <TouchableOpacity onPress={onMessage}>
              <View style={styles.iconContainer}>
                <Image
                  style={{ width: 22, height: 22 }}
                  source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FChat.png?alt=media&token=5f0ac4b3-d2ac-4af4-ba83-db9adb4027cb"
                />
              </View>
            </TouchableOpacity>
          </Optional>
          <Optional condition={showCallOption}>
            <TouchableOpacity onPress={onCall}>
              <View style={styles.iconContainer}>
                <Image
                  style={{ width: 22, height: 22 }}
                  source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FPhone.png?alt=media&token=f27c1ca8-c601-4f37-905c-61ac9ab0c9e5"
                />
              </View>
            </TouchableOpacity>
          </Optional>
        </View>
      </View>
    </View>
  );
}

export function TransitPoints({
  first_point, //
  last_point,
  showShareRide,
  onShareRide,
}) {
  const isEnableRideShare = useBoolVariation("php-enable-share-ride", false);

  return (
    <View style={styles.transitContainer}>
      <View style={{ gap: 8 }}>
        <View style={styles.transitRow}>
          <Image
            style={styles.indicator}
            cachePolicy="memory-disk"
            source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FOrigin.png?alt=media&token=7913bdfb-7b7f-41aa-aecb-433a275c92b8"
          />
          <Text weight="900" size={18} color="#1B1B1B">
            {first_point?.short_address}
          </Text>
        </View>
        <Text size={14} color="#707070">
          {first_point?.long_address}
        </Text>
      </View>
      <View style={{ gap: 8 }}>
        <View style={styles.transitRow}>
          <Image
            style={styles.indicator}
            cachePolicy="memory-disk"
            source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FDestination.png?alt=media&token=e92cc2d1-77c3-486f-9793-3c0827ca5aef"
          />
          <Text weight="900" size={18} color="#1B1B1B">
            {last_point?.short_address}
          </Text>
        </View>
        <Text size={14} color="#707070">
          {last_point?.long_address}
        </Text>
      </View>

      <Optional condition={isEnableRideShare}>
        <Optional condition={showShareRide}>
          <TouchableOpacity onPress={() => onShareRide?.()}>
            <View style={styles.shareRideRow}>
              <View style={styles.iconContainer}>
                <Image
                  style={{ height: 16, width: 18, resizeMode: "contain" }}
                  cachePolicy="memory-disk"
                  source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FShare.png?alt=media&token=4e75220d-0bc9-44ee-8aae-a8526df4d141"
                />
              </View>
              <Text weight="900" color="#10B981">
                Share this ride
              </Text>
            </View>
          </TouchableOpacity>
        </Optional>
      </Optional>
    </View>
  );
}

function FareDetails({
  estimatePreview,
  isCanceling,
  onCancel,
  showCancelOption,
  serviceCharge,
}) {
  const isEnableServiceCharge = useBoolVariation("php-enable-service-charge", false); // prettier-ignore

  return (
    <View style={styles.fareDetailsContainer}>
      <Optional condition={isEnableServiceCharge}>
        <View style={{ gap: 8 }}>
          <Text size={14} color="#707070">
            Service Charge
          </Text>
          <Optional condition={serviceCharge === 0}>
            <Text weight="bold" size={18} color="#353579">
              Free
            </Text>
          </Optional>
          <Optional condition={serviceCharge > 0}>
            <Text weight="bold" size={18} color="#1B1B1B">
              {format(serviceCharge ?? 0)}
            </Text>
          </Optional>
        </View>
      </Optional>
      <View style={{ gap: 8 }}>
        <Text size={14} color="#707070">
          Estimated Fare
        </Text>
        <Text weight="700" size={34} color="#353579">
          {estimatePreview ?? "₱ 0.00"}
        </Text>
      </View>
      <Text color="#707070" size={11}>
        This estimation is based on price regulated by LTFB. Estimated fare may
        vary in the actual trip in the application you chose.
      </Text>
      <Optional condition={showCancelOption}>
        <Cta
          disabled={isCanceling}
          onPress={onCancel}
          color={isCanceling ? "#f3f4f6" : "#D1D5DB"}
        >
          Cancel Request
        </Cta>
      </Optional>
    </View>
  );
}

function Feedback({ onClose, onSubmit }) {
  return (
    <View
      style={{
        position: "absolute",
        backgroundColor: "#00000029",
        height: "100%",
        width: "100%",
        zIndex: 4,
      }}
    >
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <View style={styles.previewContent}>
          <Text size={28} weight="bold" color="#353579">
            You have arrived!
          </Text>

          <View style={{ marginVertical: 30, gap: 12 }}>
            <Text size={18} weight="bold" color="#1B1B1B">
              Tell us how was your trip?
            </Text>
            <Text size={14} color="#707070">
              Your feedback will help improve the app experience.
            </Text>
            <View
              style={{
                backgroundColor: "#F0F0F0",
                height: 81,
                borderRadius: 10,
                padding: 16,
              }}
            >
              <TextInput
                style={{ fontFamily: "Lato-Regular", fontSize: 16 }}
                placeholder="Give us a feed back"
                multiline
              />
            </View>
          </View>
          <Cta onPress={onClose} textColor="#353579" color="transparent">
            Not Now. Thank you!
          </Cta>
          <Cta onPress={onSubmit} color="#6366F1">
            Submit
          </Cta>
        </View>
      </View>
    </View>
  );
}

function DriverIcon({ id }) {
  const [locationString] = useMMKVString(`location.${id}`);
  const location = JSON.parse(locationString || "{}");

  if (
    !location?.payload?.latitude ||
    !location?.payload?.longitude ||
    !location?.payload?.heading
  ) {
    return null;
  }

  let driverIcon = "https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2Fmotor-angkas.png?alt=media&token=f30489fe-1495-41ec-8160-f048df15b602"; // prettier-ignore
  if (location?.platform === "JoyRide") driverIcon = "https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2Fmotor-joyride.png?alt=media&token=26f5ab6b-dc4d-4870-bb29-b04ea2c21096"; // prettier-ignore
  if (location?.platform === "Move It") driverIcon = "https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2Fmotor-moveit.png?alt=media&token=adfb7d67-03bc-4213-b3cc-22270a331f91"; // prettier-ignore

  return (
    <Mapbox.MarkerView
      coordinate={[location.payload.longitude, location.payload.latitude]}
    >
      <Image
        cachePolicy="memory-disk"
        style={{
          width: 62,
          height: 62,
          transform: [{ rotate: `${location.payload.heading}deg` }],
        }}
        source={driverIcon}
      />
    </Mapbox.MarkerView>
  );
}

function GrayBar() {
  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 16,
      }}
    >
      <View
        style={{
          width: 50,
          height: 5.5,
          borderRadius: 7,
          backgroundColor: "#E8E8E8",
          marginTop: -24,
        }}
      />
    </View>
  );
}

function CancelationPrompt({ match, onProceed, onCancel }) {
  return (
    <View style={styles.promptContainer}>
      <View style={styles.cancelationContent}>
        <View style={{ paddingHorizontal: 16, paddingTop: 32 }}>
          <Text size={28} weight="700" color="#353579">
            Driver Canceled
          </Text>

          <Text size={14} color="#707070">
            Do you want to continue this trip request?
          </Text>
        </View>

        <TransitPoints
          first_point={match?.first_point}
          last_point={match?.last_point}
        />

        <View
          style={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 32 }}
        >
          <Cta
            onPress={() => onCancel?.()}
            color="transparent"
            textColor="#353579"
          >
            No. Thank you
          </Cta>

          <Cta onPress={() => onProceed?.()} color="#6366F1">
            Continue
          </Cta>
        </View>
      </View>
    </View>
  );
}

/**
 * Use case: Changing the next booking pick up reference to the current drop-off
 * Anticipating that user will in the same location for the next booking
 *
 */
function handleChangePickupReference(coordinates) {
  log.debug("Changing pickup reference to current drop-off", { coordinates });
  storage.set(
    "location.current",
    JSON.stringify({
      ...(coordinates || {}),
      shortAddress: coordinates?.short_address,
      longAddress: coordinates?.long_address,
    })
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
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    height: 24,
    width: 24,
  },
  marker: { width: 48, height: 48, marginBottom: 24 },
  indicator: { width: 12, height: 12, marginTop: 4 },
  driverInfoSubTitle: {
    justifyContent: "space-between",
    flexDirection: "row",
  },
  driverInfoContainer: {
    paddingTop: 16,
    marginTop: 16,
    borderColor: "#EAEAEA",
    borderTopWidth: 1,
  },
  driverInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  driverDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  driverImageContainer: {
    width: 55,
    height: 55,
    backgroundColor: "#f3f4f6",
    borderRadius: 9,
    overflow: "hidden",
  },
  driverImage: {
    width: "100%",
    height: "100%",
  },
  iconContainer: {
    backgroundColor: "#EFEFEF",
    height: 40,
    width: 40,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  transitContainer: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 32,
    gap: 16,
  },
  transitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  shareRideRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  fareDetailsContainer: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 32,
    gap: 16,
  },
  promptContainer: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    position: "absolute",
    justifyContent: "flex-end",
    backgroundColor: "#00000032",
    zIndex: 2,
  },
  cancelationContent: {
    backgroundColor: "white",
  },
});

/**
 * @typedef FoundPreviewProps
 * @property {() => void} onHandlerStateChange
 * @property {() => void} onMessage
 * @property {() => void} onCall
 * @property {string} driver_id
 * @property {boolean} isLoading
 * @property {string} platform
 * @property {string} eta
 * @property {string} image_url
 * @property {string} model
 * @property {string} plate_number
 * @property {string} display_name
 *
 */

/**
 * @typedef RequestedPreviewProps
 * @property {() => void} onHandlerStateChange
 * @property {string[]} services
 */
