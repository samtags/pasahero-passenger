import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";

export default function BackButton() {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={router.back} style={styles.back}>
      <Image
        style={{ width: 56, height: 56 }}
        cachePolicy="memory-disk"
        source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FCircle%20Back.png?alt=media&token=bff546fa-0686-4949-ab46-08bd9510dc4d"
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
