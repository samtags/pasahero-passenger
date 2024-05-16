import { StyleSheet, TouchableOpacity, View } from "react-native";
import Text from "../text";
import { Image } from "expo-image";

/**
 *
 * @param {Props} props
 * @returns
 */
export default function Transit({ onPress, children, indicatorSrc, color }) {
  let indicator =
    "https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FDestination.png?alt=media&token=e92cc2d1-77c3-486f-9793-3c0827ca5aef";

  if (indicatorSrc) {
    indicator = indicatorSrc;
  }

  return (
    <TouchableOpacity style={styles.button} onPress={() => onPress?.()}>
      <View style={styles.container}>
        <Image
          style={styles.indicator}
          cachePolicy="memory-disk"
          source={indicator}
        />
        <Text numberOfLines={1} color={color || "#B9B8BB"} weight="bold">
          {children}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { flex: 1 },
  container: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 16,
    paddingRight: 24,
    paddingVertical: 10.5,
    flexDirection: "row",
    borderRadius: 10,
    alignItems: "center",
    gap: 8,
  },
  indicator: { width: 12, height: 12, marginTop: 4 },
});

/**
 * @typedef Props
 * @property {() => unknown} onPress
 * @property {string} children
 * @property {string} [indicatorSrc]
 * @property {string} [color]
 */
