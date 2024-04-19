import { Link, Stack, useRouter } from "expo-router";
import {
  Image,
  Text,
  View,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import * as Location from "expo-location";

export default function Home() {
  const router = useRouter();

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
          title: "Home",
          headerStyle: { backgroundColor: "gainsboro" },
        }}
      />
      <SafeAreaView style={styles.full}>
        <View style={styles.main}>
          <TouchableOpacity onPress={handlePressSearch}>
            <Text style={styles.text}>Search</Text>
          </TouchableOpacity>
          <Link href="/messaging">
            <Text style={styles.text}>Messaging</Text>
          </Link>
          <Link href="/wallet">
            <Text style={styles.text}>Wallet</Text>
          </Link>
        </View>
      </SafeAreaView>
    </View>
  );
}

function LogoTitle() {
  return (
    <Image
      style={{ width: 50, height: 50 }}
      source={{ uri: "https://reactnative.dev/img/tiny_logo.png" }}
    />
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
