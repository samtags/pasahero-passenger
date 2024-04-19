import { useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from "react-native";

export default function Wallet() {
  return (
    <View style={styles.container}>
      <SafeAreaView>
        <Text>PH Pay</Text>
        <Text style={styles.amount}>₱56.94</Text>
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
  primary: {
    backgroundColor: "gainsboro",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  amount: {
    fontSize: 18,
    fontWeight: "600",
  },
});
