import { Stack, useGlobalSearchParams } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";

export default function Messaging() {
  const global = useGlobalSearchParams();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Messaging",
        }}
      />

      <Text style={styles.title}>{global?.transit}</Text>
      <View style={styles.spacer}>
        <View style={styles.spacer}>
          <TextInput autoFocus placeholder="Enter your message" multiline />
          <View style={styles.spacer} />
          <TouchableOpacity>
            <Text style={{ fontWeight: "bold" }}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "whitesmoke",
  },
  primary: {
    backgroundColor: "gainsboro",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  title: {
    color: "#38434D",
    marginVertical: 16,
    textAlign: "center",
  },
  spacer: {
    padding: 8,
  },
});
