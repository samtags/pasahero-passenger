import { useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from "react-native";

export default function Preview() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <TouchableOpacity onPress={router.back}>
          <Text>Back</Text>
        </TouchableOpacity>

        <Text>Preview</Text>

        <TouchableOpacity style={styles.primary}>
          <Text>Find nearby drivers</Text>
        </TouchableOpacity>
      </SafeAreaView>
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
});
