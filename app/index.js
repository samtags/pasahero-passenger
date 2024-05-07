import { Link, Stack, useRouter } from "expo-router";
import {
  Text,
  View,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import * as Location from "expo-location";
import { SignedIn, useUser } from "@clerk/clerk-expo";
import useIncomingCall from "../src/services/hooks/useIncomingCall";
import { useBoolVariation } from "@launchdarkly/react-native-client-sdk";
import Optional from "../src/components/optional";

export default function Home() {
  const router = useRouter();

  const isManualDialEnabled = useBoolVariation("php-manual-dial", false);
  const isManualMessageEnabled = useBoolVariation("php-manual-message", false);

  const user = useUser();
  useIncomingCall(user?.user?.id);

  async function handlePressSearch() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    const granted = status === "granted";
    handleGoToLocations(granted);
  }

  /** @param {boolean} granted */
  function handleGoToLocations(granted) {
    router.navigate({
      pathname: "locations",
      params: { locations: granted, foo: "bar" },
    });
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "PasaHero",
          headerStyle: { backgroundColor: "gainsboro" },
        }}
      />
      <SafeAreaView style={styles.full}>
        <View style={styles.main}>
          <TouchableOpacity onPress={handlePressSearch}>
            <Text style={styles.text}>Find Nearby Drivers</Text>
          </TouchableOpacity>
          <Link href="/match/list">
            <Text style={styles.text}>Matches</Text>
          </Link>

          <Optional condition={isManualMessageEnabled === true}>
            <Link href="/messaging">
              <Text style={styles.text}>Debug: Messaging</Text>
            </Link>
          </Optional>

          <Optional condition={isManualDialEnabled === true}>
            <Link href={"/call/dial-debug"}>
              <Text style={styles.text}>Debug: Call</Text>
            </Link>
          </Optional>

          <Link href="/wallet">
            <Text style={styles.text}>Wallet</Text>
          </Link>

          <SignedIn>
            <Link href="/profile">
              <Text style={styles.text}>Profile</Text>
            </Link>
          </SignedIn>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "whitesmoke",
  },
  main: {
    flex: 1,
    padding: 24,
    position: "relative",
    gap: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    color: "#38434D",
    marginTop: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  full: {
    flex: 1,
    backgroundColor: "whitesmoke",
  },
});

const events = [
  "participant-joined",
  "participant-updated",
  "participant-left",
];
