import { useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";

export default function Messaging() {
  const router = useRouter();

  const [roomId, setRoom] = useState("cefbafa1-080a-4053-a915-e878d5397f16");

  return (
    <View style={styles.container}>
      <Text style={{ fontWeight: "600" }}>Room</Text>

      <TextInput
        autoFocus
        value={roomId}
        placeholder="Transit"
        onChangeText={setRoom}
      />

      <View style={styles.spacer} />

      <TouchableOpacity onPress={() => router.navigate(`/messaging/${roomId}`)}>
        <Text style={{ fontWeight: "600" }}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "whitesmoke",
    padding: 24,
  },
  primary: {
    backgroundColor: "gainsboro",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    color: "#38434D",
    marginVertical: 16,
  },
  spacer: {
    padding: 8,
  },
});
