import { useState } from "react";
import { StyleSheet, View } from "react-native";
import Back from "./Back";
import Input from "./Input";
import Result from "./Result";
import useAutoComplete from "../../../services/queries/useAutoComplete";
import useDelayedValue from "../../../services/hooks/useDelayedValue";

export default function Control() {
  const [q, setQ] = useState("");

  const debouncedInput = useDelayedValue(q, 750);
  const { data = [] } = useAutoComplete(debouncedInput);
  const result = handleTransformAutoCompleteResult(data);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Back />
        <Input onChangeText={setQ} />
      </View>
      <Result data={result} />
    </View>
  );
}

function handleTransformAutoCompleteResult(data) {
  return data?.map((item) => ({
    placeId: item.place_id,
    shortAddress: item.structured_formatting?.main_text,
    longAddress: item.description,
  }));
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    padding: 16,
    paddingTop: 40,
    width: "100%",
    height: "100%",
    zIndex: 1,
  },
  row: {
    flexDirection: "row",
  },
});
