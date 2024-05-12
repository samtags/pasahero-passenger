import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useState } from "react";
import SearchResult from "../../../components/locations/SearchResult";
import useDelayedValue from "../../../services/hooks/useDelayedValue";
import useAutoComplete from "../../../services/queries/useAutoComplete";
import { useRouter } from "expo-router";

export default function TransitSearchFirstScreen() {
  const router = useRouter();

  const [q, setQ] = useState("");
  const debouncedInput = useDelayedValue(q, 750);
  const { data: autoCompleteResults = [] } = useAutoComplete(debouncedInput);

  function handleChangeText(text) {
    setQ(text);
  }

  function handleSelect(item) {
    // todo: do something with the selected item
    console.log("🚀 ~ handleSelect ~ item:", item);

    router.replace({
      pathname: "/match",
      params: {},
    });
  }

  function handlePressPin() {
    // handle: goto pin
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heading}>
        <View style={styles.inputContainer}>
          <Image
            style={styles.indicator}
            cachePolicy="memory-disk"
            source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FOrigin.png?alt=media&token=7913bdfb-7b7f-41aa-aecb-433a275c92b8"
          />
          <TextInput
            autoFocus
            style={styles.textInput}
            onChangeText={handleChangeText}
            value={q}
            placeholder="Search location"
          />
        </View>
        <TouchableOpacity onPress={handlePressPin} style={styles.pinButton}>
          <Image
            style={styles.pin}
            cachePolicy="memory-disk"
            source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FPin.png?alt=media&token=0a4a96e6-d58c-4749-a315-9955f0f7e415"
          />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.full}
        contentContainerStyle={styles.contentContainerStyle}
      >
        {autoCompleteResults?.map((item) => (
          <SearchResult
            key={item?.place_id}
            shortAddress={item?.structured_formatting?.main_text}
            longAddress={item?.description}
            onPress={() => handleSelect(item)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  heading: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 16,
  },
  inputContainer: {
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    paddingVertical: 4.5,
    paddingLeft: 16,
    paddingRight: 36,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  indicator: { width: 12, height: 12 },
  textInput: {
    fontSize: 16,
    fontFamily: "Lato-Bold",
    color: "#1B1B1B",
  },
  pinButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 12,
  },
  pin: { width: 24, height: 24 },
  full: { flex: 1 },
  contentContainerStyle: {
    paddingHorizontal: 16,
  },
});
