import { SafeAreaView, StyleSheet, Text, View } from "react-native";

import { Link } from "expo-router";

export default function Page() {
  return (
    <View style={styles.container}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "whitesmoke",
  },
  main: {
    flex: 1,
    paddingHorizontal: 24,
    position: "relative",
    gap: 16,
  },
  text: {
    fontSize: 24,
    color: "#38434D",
    marginTop: 16,
  },
  full: {
    flex: 1,
  },
});
