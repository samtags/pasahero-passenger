import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import {
  Stack,
  useGlobalSearchParams,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import useAutoComplete from "../../services/queries/useAutoComplete";
import { useState } from "react";
import TransitItem from "../../components/locations/TransitItem";
import useDelayedValue from "../../services/hooks/useDelayedValue";
import Optional from "../../components/optional";
import useOnUpdate from "../../services/hooks/useOnUpdate";
import * as ExpoLocation from "expo-location";

export default function Locations(props) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const globalParams = useGlobalSearchParams();

  /** @type {[Location, (v: Location) => void]} */
  const [pickup, setPickUp] = useState(null);

  /** @type {[Location, (v: Location) => void]} */
  const [dropoff, setDropOff] = useState(null);

  const [focusedTransit, setFocusedTransit] = useState("last"); // first, ..., last

  const [q, setQ] = useState("");
  const debouncedInput = useDelayedValue(q, 750);
  const { data = [], isLoading } = useAutoComplete(debouncedInput);

  useOnUpdate(handleOnTransitValuesChange, [pickup, dropoff]);

  function handleOnTransitValuesChange() {
    if (pickup && dropoff) {
      router.navigate("preview", {
        pickup,
        dropoff,
      });
    }
  }

  /** @param {Location} location  */
  function handleSelectSuggestion(location) {
    if (focusedTransit === "first") {
      setPickUp(location);

      // focus to the first transit if the first transit is empty
      if (dropoff === null) setFocusedTransit("last");
    } else {
      setDropOff(location);

      // focus to the last transit if the last transit is empty
      if (pickup === null) setFocusedTransit("first");
    }

    setQ("");
  }

  /** @param {string} text */
  function handleChangePickUpText(text) {
    // reset the value if the user updates the pickup text
    if (pickup) setPickUp(null);

    setQ(text);
  }

  /** @param {string} text */
  function handleChangeDropOffText(text) {
    // reset the value if the user updates the pickup text
    if (dropoff) setDropOff(null);

    setQ(text);
  }

  /** @param {"first" | "last"} redirectSource */
  async function handleRedirectToPin(redirectSource) {
    const coordinates = await handleGetCurrentPosition();

    router.navigate({
      pathname: "pin",
      params: {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        redirectSource,
      },
    });
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.row, { gap: 8 }]}>
        <TouchableOpacity style={{ marginTop: 12 }} onPress={router.back}>
          <Text>Back</Text>
        </TouchableOpacity>
        <View style={styles.full}>
          <TransitItem
            placeholder="See you at?"
            isActive={focusedTransit === "first"}
            onPress={() => setFocusedTransit("first")}
            onClear={() => setPickUp(null)}
            onChangeText={handleChangePickUpText}
            overwriteValue={pickup?.structured_formatting.main_text}
            onPressPin={() => handleRedirectToPin("first")}
            showPinOption={false}
          />

          <TransitItem
            placeholder="Going to?"
            isActive={focusedTransit === "last"}
            onPress={() => setFocusedTransit("last")}
            onClear={() => setDropOff(null)}
            onChangeText={handleChangeDropOffText}
            overwriteValue={dropoff?.structured_formatting.main_text}
            onPressPin={() => handleRedirectToPin("last")}
            showPinOption={params.locations === "true"}
          />
        </View>
      </View>

      <Optional condition={isLoading}>
        <View style={styles.center}>
          <Text>...</Text>
        </View>
      </Optional>

      <View style={styles.list}>
        {data.map((item) => {
          return (
            <TouchableOpacity
              onPress={() => handleSelectSuggestion(item)}
              key={item.place_id}
            >
              <Text>{item.description}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

async function handleGetCurrentPosition() {
  const { coords } = await ExpoLocation.getCurrentPositionAsync({
    accuracy: ExpoLocation.Accuracy.Highest,
  });

  return coords;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: "whitesmoke",
    paddingTop: 48,
    gap: 12,
  },
  input: {
    fontSize: 18,
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
  transitItem: {
    flex: 1,
    gap: 8,
  },
  list: {
    gap: 16,
  },
  row: {
    flexDirection: "row",
  },
  full: {
    flex: 1,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  space: {
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  active: {
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
  },
});

/**
 * @typedef {object} StructuredFormatting
 * @property {string} main_text
 * @property {string} secondary_text
 *
 * @typedef {object} Location
 * @property {string} description
 * @property {string} place_id
 * @property {string} reference
 * @property {StructuredFormatting} structured_formatting
 * @property {object[]} terms
 * @property {string[]} types
 *
 */
