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
          source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FPrediction.png?alt=media&token=21bbdf2d-1513-4245-ba1f-b6083baf5d5c"
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
    gap: 8,
    paddingVertical: 16,
    paddingLeft: 8,
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
    paddingRight: 16,
  },
});

/**
 * @typedef PredictionProps
 * @property {string} shortAddress
 * @property {string} longAddress
 * @property {() => unknown} [onPress]
 */
