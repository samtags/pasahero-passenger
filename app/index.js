import { Link, Stack } from "expo-router";
import { Image, Text, View, SafeAreaView, StyleSheet } from "react-native";

export default function Home() {
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
          <Link href="/locations">
            <Text style={styles.text}>Search</Text>
          </Link>
          <Link href="/messaging">
            <Text style={styles.text}>Messaging</Text>
          </Link>
          <Link href="/topup">
            <Text style={styles.text}>Top-up</Text>
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
