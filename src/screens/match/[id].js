import { Link, useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";

export default function Match() {
  const params = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ gap: 8, flex: 1 }}>
          <Text style={{ textAlign: "center" }}>{params.id}</Text>
          <Link href={`/messaging/${params.id}`}>
            <Text style={{ textAlign: "center", fontWeight: "600" }}>
              Send Message
            </Text>
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
    padding: 24,
  },
  button: {
    backgroundColor: "gainsboro",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});
