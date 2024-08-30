import { useRef } from "react";
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
import useMatches from "../../services/queries/useMatches";
import Optional from "../../components/optional";
import { IfFeatureEnabled } from "@growthbook/growthbook-react";

// todo: on refocus on home refetch matches

export default function Home() {
  const cameraRef = useRef(null);
  const user = useUser();
  const router = useRouter();
  const [loc] = useMMKVString("location.current");
  const location = JSON.parse(loc || "{}");
  const { data: matches = [] } = useMatches();

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

  let greeting = "Hi,";

  if (user?.user?.firstName) {
    greeting = `Hi ${user?.user?.firstName}!`;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.full}>
        <View pointerEvents="box-none" style={styles.absolute}>
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
            style={{ width: 56, height: 56 }}
            cachePolicy="memory-disk"
            source={account}
          />
        </TouchableOpacity>

        <IfFeatureEnabled feature="passenger-ongoing-trip-indicator">
          <Optional condition={matches?.length > 0}>
            <TouchableOpacity
              onPress={router.navigate.bind(null, "/match/list")}
              style={styles.ongoingTripIcon}
            >
              <View style={{ position: "relative" }}>
                <View style={styles.badge}>
                  <Text size={12} color="white">
                    {matches.length}
                  </Text>
                </View>
              </View>
              <Image
                style={{ width: 58, height: 58 }}
                cachePolicy="memory-disk"
                contentFit="contain"
                source={ongoing}
              />
            </TouchableOpacity>
          </Optional>
        </IfFeatureEnabled>

        <TouchableOpacity onPress={handleRecenterMap} style={styles.centerIcon}>
          <Image
            style={{ width: 56, height: 56 }}
            cachePolicy="memory-disk"
            source={center}
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
        </Mapbox.MapView>
      </SafeAreaView>
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
    position: "absolute",
    zIndex: 1,
    padding: 16,
    bottom: 160,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: 0,
    backgroundColor: "#EF4444",
    zIndex: 2,
    justifyContent: "center",
    alignItems: "center",
    width: 20,
    borderRadius: 20,
    height: 20,
  },
  centerIcon: {
    position: "absolute",
    zIndex: 1,
    paddingRight: 14,
    paddingBottom: 16,
    right: 0,
    bottom: 160,
  },
});
