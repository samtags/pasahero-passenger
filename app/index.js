import { Link, Stack, useRouter } from "expo-router";
import {
  Text,
  View,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import * as Location from "expo-location";
import { SignedIn, useAuth } from "@clerk/clerk-expo";

export default function Home() {
  const router = useRouter();
  const { signOut } = useAuth();

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
          {/* <Link href="/demand">
            <Text style={styles.text}>Create Demand</Text>
          </Link>
          <Link href="/messaging">
            <Text style={styles.text}>Messaging</Text>
          </Link> */}
          <Link href="/call">
            <Text style={styles.text}>Call</Text>
          </Link>
          <Link href="/join">
            <Text style={styles.text}>Join</Text>
          </Link>
          <Link href="/wallet">
            <Text style={styles.text}>Wallet</Text>
          </Link>
          <SignedIn>
            <Link href="" onPress={signOut}>
              <Text style={styles.text}>Sign Out</Text>
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
