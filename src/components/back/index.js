import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";
import { backCircle } from "../../services/images/remote";

export default function BackButton() {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={router.back} style={styles.back}>
      <Image
        style={{ width: 56, height: 56 }}
        cachePolicy="memory-disk"
        source={backCircle}
      />
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  back: {
    position: "absolute",
    zIndex: 3,
    padding: 16,
    paddingTop: 40,
  },
});
