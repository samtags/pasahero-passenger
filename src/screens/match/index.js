import { useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import MapView from "react-native-maps";

export default function Match() {
  const params = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ width: "100%", height: 180 }}>
          <MapView
            style={{
              height: "100%",
              width: "100%",
            }}
          />
        </View>
        <View style={{ flex: 1, paddingBottom: 16 }}>
          <View style={{ gap: 8, padding: 16 }}>
            <Text>{params["first.address"]}</Text>
            <Text>{params["last.address"]}</Text>
          </View>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={styles.button}>
            <Text>Request</Text>
          </TouchableOpacity>
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
  button: {
    backgroundColor: "gainsboro",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flexShrink: 0,
  },
});
