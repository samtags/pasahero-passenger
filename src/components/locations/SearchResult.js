import { View, StyleSheet, TouchableOpacity } from "react-native";
import Text from "../../components/text";
import { Image } from "expo-image";

/**
 *
 * @param {PredictionProps} props
 */
export default function SearchResult({ shortAddress, longAddress, onPress }) {
  return (
    <TouchableOpacity onPress={() => onPress?.()}>
      <View style={styles.container}>
        <Image
          style={styles.indicator}
          cachePolicy="memory-disk"
          source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FLocation.png?alt=media&token=d410e0c5-41d3-4a7a-a98e-333727a1820f"
        />
        <View style={styles.content}>
          <Text numberOfLines={1} color="#1B1B1B" weight="bold" size={18}>
            {shortAddress}
          </Text>
          <Text numberOfLines={2} color="#707070" size={14}>
            {longAddress}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },
  indicator: {
    width: 24,
    height: 24,
  },
  content: {
    gap: 6,
    flex: 1,
  },
});

/**
 * @typedef PredictionProps
 * @property {string} shortAddress
 * @property {string} longAddress
 * @property {() => unknown} [onPress]
 */
