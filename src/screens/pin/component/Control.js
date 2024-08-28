import { StyleSheet, View } from "react-native";
import Back from "./Back";
import Input from "./Input";
import Result from "./Result";

export default function Control() {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Back />
        <Input />
      </View>
      <Result />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    padding: 16,
    paddingTop: 40,
    maxHeight: "60%",
    width: "100%",
    height: "100%",
    zIndex: 1,
  },
  row: {
    flexDirection: "row",
  },
});
