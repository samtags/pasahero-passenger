import { useContext } from "react";
import { StyleSheet, View } from "react-native";
import Back from "./Back";
import Input from "./Input";
import Result from "./Result";
import Optional from "../../../components/optional";
import { Context } from "./Provider";

export default function Control({ onSelect }) {
  const {
    selected,
    setSelected,
    isKeyboardVisible,
    setQ,
    displayedValue,
    setDisplayedValue,
    suggestion,
  } = useContext(Context);

  const handleOnSelect = (data) => {
    setSelected(data);
    onSelect?.(data);
    setDisplayedValue(data.shortAddress);
  };

  const handleChangeText = (value) => {
    setQ(value);
    setDisplayedValue(value);
  };

  const handleOnClear = () => {
    setQ("");
    setDisplayedValue("");
  };

  let selectionSetting = undefined;
  const containerStyles = [styles.container];

  if (isKeyboardVisible === false) {
    selectionSetting = { start: 0, end: displayedValue.length };
    containerStyles.push(styles.short);
  } else {
    containerStyles.push(styles.long);
  }

  return (
    <View style={containerStyles}>
      <View style={styles.row}>
        <Back />
        <Input
          onClear={handleOnClear}
          selection={selectionSetting}
          onChangeText={handleChangeText}
          value={displayedValue}
          showClearOption={isKeyboardVisible && displayedValue}
        />
      </View>
      <Optional condition={Boolean(selected) === false}>
        <Result onSelect={handleOnSelect} data={suggestion} />
      </Optional>
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
    // height: "100%",
    zIndex: 1,
  },
  row: {
    flexDirection: "row",
  },
  short: {
    height: "75%",
  },
  long: {
    height: "100%",
  },
});
