import { useRef, useEffect } from "react";
import { useMMKVString } from "react-native-mmkv";
import { Stack, useRouter } from "expo-router";
import { View, SafeAreaView, StyleSheet, TouchableOpacity } from "react-native";
import Text from "../../components/text";
import Mapbox from "@rnmapbox/maps";
import Transit from "../../components/locations/Transit";
import log from "../../services/log";
import storage from "../../services/storage";
import { Image } from "expo-image";
import { useUser } from "@clerk/clerk-expo";
import useIncomingCall from "../../services/hooks/useIncomingCall";
import useOnUpdate from "../../services/hooks/useOnUpdate";
import initializeUser from "../../services/api/initializeUser";
import initializeWallet from "../../services/api/initializeWallet";
import usePushNotification from "../../services/notification/usePushNotification";
import { account, center } from "../../services/images/remote";
import { ongoing } from "../../services/images/remote";
import useMatches, {
  invalidateUseMatches,
} from "../../services/queries/useMatches";
import Optional from "../../components/optional";
import { IfFeatureEnabled } from "@growthbook/growthbook-react";
import useOnFocus from "../../services/hooks/useOnFocus";
import useNearbyDrivers from "../../services/hooks/useNearbyDrivers";
import supabase from "../../services/supabase";

export default function Home() {
  const cameraRef = useRef(null);
  const user = useUser();
  const router = useRouter();
  const [loc] = useMMKVString("location.current");
  const location = JSON.parse(loc || "{}");
  const { data: matches = [] } = useMatches();

  const { nearbyDriverIds } = useNearbyDrivers({
    startOnMount: true,
    payload: location,
  });

  const handleOnPressWhereTo = () => {
    handleInitializeDraft();
    router.navigate("/transit/search/last");
  };

  const handleRecenterMap = () => {
    if (cameraRef?.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [location.longitude, location.latitude],
        animationMode: "flyTo",
      });
    }
  };

  usePushNotification(user?.user?.id);
  useIncomingCall(user?.user?.id);

  useOnUpdate(() => {
    const userInfo = user?.user;

    if (userInfo) {
      handleInitializeUser(userInfo);
    }
  }, [user?.user]);

  useOnFocus(() => {
    log.debug("User is in the home screen.");
    invalidateUseMatches();
  }, []);

  let greeting = "Hi,";

  if (user?.user?.firstName) {
    greeting = `Hi ${user?.user?.firstName}!`;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.full}>
        <View pointerEvents="box-none" style={styles.absolute}>
          <View style={styles.widgetContainer}>
            <View>
              <IfFeatureEnabled feature="passenger-ongoing-trip-indicator">
                <Optional condition={matches?.length > 0}>
                  <TouchableOpacity
                    onPress={router.navigate.bind(null, "/match/list")}
                  >
                    <View style={styles.ongoingTripIcon}>
                      <View style={{ width: 63, height: 63 }}>
                        <Image
                          style={{ width: "100%", height: "100%" }}
                          cachePolicy="memory-disk"
                          contentFit="contain"
                          source={ongoing}
                        />
                        <View style={styles.badge}>
                          <Text size={12} color="white">
                            {matches.length}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Optional>
              </IfFeatureEnabled>
            </View>
            <TouchableOpacity onPress={handleRecenterMap}>
              <Image
                style={{ width: 60, height: 60 }}
                cachePolicy="memory-disk"
                source={center}
              />
            </TouchableOpacity>
          </View>

          <IfFeatureEnabled feature="home-driver-count-promotion">
            <Optional condition={nearbyDriverIds?.length > 0}>
              <MatchPromo onPress={() => {}} count={nearbyDriverIds?.length} />
            </Optional>
          </IfFeatureEnabled>

          <View style={styles.content}>
            <Text size={18} weight="bold" color="#757477">
              {greeting}
            </Text>
            <Text size={28} weight="bold" color="#353579">
              Where are we going?
            </Text>
            <View style={styles.heading}>
              <Transit onPress={handleOnPressWhereTo}>Going to?</Transit>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={router.navigate.bind(null, "/account")}
          style={styles.accountIcon}
        >
          <Image
            style={{ width: 60, height: 60 }}
            cachePolicy="memory-disk"
            source={account}
          />
        </TouchableOpacity>

        <Mapbox.MapView
          scaleBarEnabled={false}
          style={styles.map}
          styleURL="mapbox://styles/mapbox/streets-v12"
          logoPosition={{ top: -100, left: 0 }}
          attributionEnabled={false}
        >
          <Mapbox.Camera
            ref={cameraRef}
            animationMode="none"
            zoomLevel={15}
            centerCoordinate={[location.longitude, location.latitude]}
          />
          <DriverDisplay ids={nearbyDriverIds} />
        </Mapbox.MapView>
      </SafeAreaView>
    </View>
  );
}

function MatchPromo({ onPress, count = 0 }) {
  let label = "driver";
  if (count > 1) label = "drivers";

  return (
    <View style={styles.matchPromoContainer}>
      <TouchableOpacity onPress={onPress} style={{ width: "100%" }}>
        <View style={styles.promoButton}>
          <Text size={18} color="#fff" weight="medium">
            {count} {label} nearby! Book Now
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

function handleInitializeDraft() {
  const currentLocation = storage.getString("location.current");
  const location = JSON.parse(currentLocation);

  const draft = {
    first: {
      latitude: location.latitude,
      longitude: location.longitude,
      shortAddress: location.shortAddress,
      longAddress: location.longAddress,
    },
    last: {},
  };

  log.debug("User initialized draft", { ["match.draft"]: draft });
  storage.set("match.draft", JSON.stringify(draft));
}

function handleInitializeUser(userInfo) {
  log.debug("Initializing user data.", { userInfo });

  if (userInfo) {
    const id = userInfo.id;
    const name = userInfo.fullName;
    const firstName = userInfo.firstName;
    const lastName = userInfo.lastName;
    const imageUrl = userInfo.imageUrl;
    const email = userInfo.primaryEmailAddress?.emailAddress;

    log.debug("Storing user data to state.", { userInfo, id, name, firstName, lastName, imageUrl, email }); // prettier-ignore

    if (id) storage.set("user.id", id);
    if (name) storage.set("user.name", name);
    if (firstName) storage.set("user.firstName", firstName);
    if (lastName) storage.set("user.lastName", lastName);
    if (imageUrl) storage.set("user.imageUrl", imageUrl);
    if (email) storage.set("user.email", email);

    const payload = {};

    if (name) payload.name = name;
    if (imageUrl) payload.image_url = imageUrl;

    initializeUser(id, payload);
    initializeWallet(id);
  }
}

export function handleResetUser() {
  storage.delete("user.id");
  storage.delete("user.name");
  storage.delete("user.firstName");
  storage.delete("user.lastName");
  storage.delete("user.imageUrl");
  storage.delete("user.email");
}

export function handleResetApp() {
  storage.delete("app.handledCallSessionIds");
}

function DriverDisplay({ ids }) {
  const idsRef = useRef(new Set());
  const subscriptionMapRef = useRef(new Map());

  useEffect(() => {
    const subscriptionMap = subscriptionMapRef.current;
    const oldIds = idsRef?.current;
    const newIds = new Set();

    const addedIds = new Set();
    const removedIds = new Set();

    // check added ids
    log.debug("Checking for added ids.", { ids, oldIds: Array.from(oldIds) }); // prettier-ignore
    ids?.forEach((id) => {
      if (!oldIds.has(id)) {
        addedIds.add(id);
      }

      newIds.add(id);
    });

    log.debug("Checking added ids completed.", { addedIds: Array.from(addedIds), ids }); // prettier-ignore

    log.debug("Checking for removed ids.", { newIds: Array.from(newIds), oldIds: Array.from(oldIds) }); // prettier-ignore
    oldIds?.forEach((id) => {
      if (!newIds.has(id)) {
        removedIds.add(id);
      }
    });
    log.debug("Checking removed ids completed.", { removedIds: Array.from(removedIds), newIds: Array.from(newIds), oldIds: Array.from(oldIds) }); // prettier-ignore

    log.debug("Subscribing to the new ids.", { ids: Array.from(newIds) });
    let count = 1;
    addedIds.forEach((id) => {
      log.debug(`${count}/${addedIds.size} Subscribing. __tmp_location.${id}`, { id }); // prettier-ignore

      const channel = supabase
        .channel(`location.${id}`)
        .on("broadcast", { event: "location_update" }, (data) => {
          log.debug("Received a location update.", { location, id });

          const location = JSON.parse(data.payload);
          log.debug(`Storing: [__tmp_location.${id}]`, { location });
          storage.set(`__tmp_location.${id}`, JSON.stringify(location));
        })
        .subscribe();

      subscriptionMap.set(id, channel);
      count++;
    });

    // reset count
    count = 1;

    log.debug("Unsubscribing from the removed ids.", { ids: Array.from(removedIds) }); // prettier-ignore
    removedIds.forEach((id) => {
      const channel = subscriptionMap.get(id);
      channel?.unsubscribe?.();
      subscriptionMap.delete(id);

      log.debug(
        `[${count}/${removedIds.size}] Unsubscribing. __tmp_location.${id}`,
        { id }
      );
    });

    addedIds.forEach((id) => oldIds.add(id));
  }, [ids]);

  return null;
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
    zIndex: 1,
    height: "100%",
    width: "100%",
    justifyContent: "flex-end",
  },
  content: {
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
  accountIcon: {
    position: "absolute",
    zIndex: 1,
    padding: 16,
    paddingTop: 40,
  },
  ongoingTripIcon: {
    position: "relative",
    zIndex: 1,
    // bottom: 227.5,
  },
  badge: {
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    width: 20,
    borderRadius: 20,
    height: 20,
    position: "absolute",
    top: 0,
    right: 0,
  },
  widgetContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  matchPromoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  promoButton: {
    backgroundColor: "#363F59",
    borderRadius: 40,
    paddingVertical: 16,
    width: "100%",
    alignItems: "center",
  },
});
