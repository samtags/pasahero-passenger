import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  TouchableWithoutFeedback,
} from "react-native";
import Optional from "../optional";
import { useState } from "react";
import useOnUpdate from "../../services/hooks/useOnUpdate";

/**
 * @typedef Props
 * @property {() => unknown} onPress
 * @property {string} placeholder
 * @property {(v: string) => void} onChangeText
 * @property {boolean} [isActive]
 * @property {() => unknown} [onClear]
 * @property {string} [overwriteValue]
 *
 * @param {Props} props
 * @returns
 */
export default function TransitItem(props) {
  const {
    onPress,
    placeholder,
    onChangeText,
    isActive,
    onClear,
    overwriteValue,
  } = props;

  const [value, setValue] = useState("");

  useOnUpdate(() => {
    setValue(props.overwriteValue);
  }, [overwriteValue]);

  const containerStyles = [styles.transit];
  if (isActive) containerStyles.push(styles.active);

  const handleChangeText = (v) => {
    setValue(v);
    onChangeText(v);
  };

  function handleOnClear() {
    setValue("");
    onClear?.();
  }

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={containerStyles}>
        <View style={styles.transitIcon} />
        <View style={styles.full}>
          <Optional condition={isActive}>
            <TextInput
              autoFocus
              value={value}
              onChangeText={handleChangeText}
              style={styles.input}
              placeholder={placeholder}
            />
          </Optional>
          <Optional condition={Boolean(isActive) === false}>
            <>
              <Optional condition={Boolean(value) === false}>
                <Text numberOfLines={1}>{placeholder}</Text>
              </Optional>

              <Optional condition={value}>
                <Text numberOfLines={1}>{value}</Text>
              </Optional>
            </>
          </Optional>
        </View>
        <Optional condition={isActive && value}>
          <TouchableOpacity onPress={handleOnClear}>
            <View style={styles.clearIcon} />
          </TouchableOpacity>
        </Optional>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  input: {
    fontSize: 16,
  },
  transit: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    position: "relative",
  },
  transitIcon: {
    height: 20,
    width: 20,
    borderRadius: 20,
    backgroundColor: "gainsboro",
  },
  clearIcon: {
    height: 14,
    width: 14,
    borderRadius: 14,
    backgroundColor: "gainsboro",
  },
  active: {
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
  },
  full: {
    flex: 1,
  },
});
