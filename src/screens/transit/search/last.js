import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useRef, useState } from "react";
import SearchResult from "../../../components/locations/SearchResult";
import useDelayedValue from "../../../services/hooks/useDelayedValue";
import useAutoComplete from "../../../services/queries/useAutoComplete";
import { useRouter } from "expo-router";
import storage from "../../../services/storage";
import log from "../../../services/log";
import getCoordinatesByPlaceId from "../../../services/api/getCoordinatesByPlaceId";

export default function TransitSearchLastScreen() {
  const router = useRouter();
  const textInputRef = useRef(null);

  const [q, setQ] = useState("");
  const debouncedInput = useDelayedValue(q, 750);
  const { data: autoCompleteResults = [] } = useAutoComplete(debouncedInput);

  function handleChangeText(text) {
    setQ(text);
  }

  async function handleSelect(item) {
    setQ(item?.description);

    router.replace("/transit/search/confirm-first");

    getCoordinatesByPlaceId(item?.place_id)
      .then((res) => {
        handleSetTransitLast({
          latitude: res?.data?.result?.geometry?.location?.lat,
          longitude: res?.data?.result?.geometry?.location?.lng,
          shortAddress: item?.structured_formatting?.main_text,
          longAddress: item?.description,
        });
      })
      .catch((error) => {
        log.error("Failed to get coordinates by place ID.", { error });

        Alert.alert(
          "Oops!",
          "We encountered an error while processing the selected destination. Please try to search a destination again."
        );

        log.debug(
          "Oops, We encountered an error while processing the selected destination. Please try to search a destination again.",
          { error }
        );

        router.replace("/transit/search/last");
      });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heading}>
        <View style={styles.inputContainer}>
          <Image
            style={styles.indicator}
            cachePolicy="memory-disk"
            source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FDestination.png?alt=media&token=e92cc2d1-77c3-486f-9793-3c0827ca5aef"
          />
          <TextInput
            autoFocus
            ref={textInputRef}
            style={styles.textInput}
            onChangeText={handleChangeText}
            value={q}
            placeholder="Search location"
          />
        </View>
        <TouchableOpacity
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingLeft: 12,
          }}
        >
          <Image
            style={{ width: 24, height: 24 }}
            cachePolicy="memory-disk"
            source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FPin.png?alt=media&token=0a4a96e6-d58c-4749-a315-9955f0f7e415"
          />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
        }}
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

function handleSetTransitLast({
  latitude,
  longitude,
  shortAddress,
  longAddress,
}) {
  let draft = {};

  try {
    const _matchDraft = storage.getString("match.draft");
    log.debug("Got match.draft", { data: _matchDraft });
    draft = JSON.parse(_matchDraft);
  } catch {
    log.warn("Failed to parse match.draft in last transit search.");
  }

  draft.last = { latitude, longitude, shortAddress, longAddress };

  storage.set("match.draft", JSON.stringify(draft));
  log.debug("Updated match.draft", {draft, latitude, longitude, shortAddress, longAddress}) // prettier-ignore
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
});
