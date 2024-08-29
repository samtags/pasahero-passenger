import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { to, closeGray } from "../../../services/images/remote";
import Optional from "../../../components/optional";

export default function Input({
  onChangeText,
  onFocus,
  onBlur,
  value,
  selection,
  onClear,
  showClearOption,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Image style={styles.indicator} cachePolicy="memory-disk" source={to} />
        <TextInput
          selection={selection}
          onFocus={() => onFocus?.()}
          onBlur={() => onBlur?.()}
          placeholder="Search drop-off location"
          style={styles.textInput}
          onChangeText={(e) => onChangeText?.(e)}
          value={value}
        />
      </View>
      <Optional condition={showClearOption}>
        <TouchableOpacity onPress={() => onClear?.()}>
          <Image
            style={{ width: 20, height: 20 }}
            cachePolicy="memory-disk"
            source={closeGray}
          />
        </TouchableOpacity>
      </Optional>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  row: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  textInput: {
    fontSize: 16,
    fontFamily: "Lato-Bold",
    color: "#1B1B1B",
    flex: 1,
    paddingRight: 16,
  },
  indicator: { width: 16, height: 16 },
});
