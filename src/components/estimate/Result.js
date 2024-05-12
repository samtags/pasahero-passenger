import { StyleSheet, TouchableOpacity, View } from "react-native";
import Text from "../../components/text";
import { Image } from "expo-image";

/**
 *
 * @param {Props} props
 * @returns
 */
export default function EstimateItem({
  platform,
  serviceName,
  serviceImage,
  estimatedFare,
  highlightColor,
  isSelected,
  onSelect,
}) {
  return (
    <TouchableOpacity onPress={() => onSelect?.()}>
      <View style={styles.container}>
        <View style={styles.contentRow}>
          <View style={styles.serviceImageContainer}>
            <Image
              source={serviceImage}
              cachePolicy="memory-disk"
              style={styles.image}
            />
          </View>
          <View>
            <Text size={18} color="#1B1B1B" weight="bold">
              {estimatedFare}
            </Text>
            <Text size={14} color="#707070">
              <Text size={14} color={highlightColor} weight="bold">
                {platform}
              </Text>{" "}
              {serviceName}
            </Text>
          </View>
        </View>
        <View style={styles.checkboxContainer}>
          <Image
            style={styles.image}
            cachePolicy="memory-disk"
            source={
              isSelected
                ? "https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FChecked.png?alt=media&token=37eb6137-cea4-4e8d-bfbf-47c72141c546"
                : "https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FUnchecked.png?alt=media&token=0d879712-7900-4de4-9ec8-02720b88cf71"
            }
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderColor: "#EAEAEA",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  serviceImageContainer: {
    width: 24,
    height: 24,
    backgroundColor: "#e5e7eb",
    borderRadius: 24,
    overflow: "hidden",
  },
  checkboxContainer: {
    height: 15,
    width: 15,
    overflow: "hidden",
  },
  checkboxButton: {
    padding: 8,
  },
  image: {
    height: "100%",
    width: "100%",
  },
});

/**
 * @typedef Props
 * @property {string} platform
 * @property {string} serviceName
 * @property {string} estimatedFare
 * @property {string} highlightColor
 * @property {boolean} [isSelected]
 * @property {() => unknown} onSelect
 */
