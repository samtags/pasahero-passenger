import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { back } from "../../../services/images/remote";

export default function Back() {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={router.back}>
      <Image
        style={{ width: 72, height: 72, marginTop: -15, marginLeft: -14 }}
        cachePolicy="memory-disk"
        source={back}
      />
    </TouchableOpacity>
  );
}
