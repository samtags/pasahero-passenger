import { useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";

export default function Match() {
  const params = useLocalSearchParams();
  console.log("🚀 ~ Match ~ params:", params);

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ gap: 8, flex: 1 }}>
          <Text>{params.id}</Text>
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
