import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import useAutoComplete from "../../services/queries/useAutoComplete";
import { useState } from "react";
import TransitItem from "../../components/locations/TransitItem";
import useDelayedValue from "../../services/hooks/useDelayedValue";
import Optional from "../../components/optional";
import useOnUpdate from "../../services/hooks/useOnUpdate";
import * as ExpoLocation from "expo-location";

export default function Locations() {
  const router = useRouter();
  const params = useLocalSearchParams();

  /** @type {[Location, (v: Location) => void]} */
  const [pickup, setPickUp] = useState(null);

  /** @type {[Location, (v: Location) => void]} */
  const [dropoff, setDropOff] = useState(null);

  const [focusedTransit, setFocusedTransit] = useState("last"); // first, ..., last

  const [q, setQ] = useState("");
  const debouncedInput = useDelayedValue(q, 750);
  const { data = [], isLoading } = useAutoComplete(debouncedInput);

  useOnUpdate(handleUpdateParams, [params]);

  function handleSetPickUp(location) {
    setPickUp(location);
    if (dropoff) {
      handleRedirectToConfirm({
        "first.placeId": location?.place_id,
        "first.address": location?.description,
        "first.short_address": location?.structured_formatting?.main_text,
        "last.placeId": dropoff?.place_id,
        "last.address": dropoff?.description,
        "last.short_address": dropoff?.structured_formatting?.main_text,
      });
    }
  }

  function handleSetDropOff(location) {
    setDropOff(location);
    if (pickup) {
      handleRedirectToConfirm({
        "first.placeId": pickup?.place_id,
        "first.address": pickup?.description,
        "first.short_address": pickup?.structured_formatting?.main_text,
        "last.placeId": location?.place_id,
        "last.address": location?.description,
        "last.short_address": location?.structured_formatting?.main_text,
      });
    }
  }

  function handleUpdateParams() {
    if (params?.["first.placeId"]) {
      if (pickup?.place_id !== params["first.placeId"]) {
        handleSetPickUp({
          description: params["first.address"],
          place_id: params["first.placeId"],
          structured_formatting: {
            main_text: params["first.address"],
            secondary_text: params["first.short_address"],
          },
        });

        // focus to the last transit if the last transit is empty
        if (dropoff === null) setFocusedTransit("last");
      }
    }

    if (params?.["last.placeId"]) {
      if (dropoff?.place_id !== params["last.placeId"]) {
        handleSetDropOff({
          description: params["last.address"],
          place_id: params["last.placeId"],
          structured_formatting: {
            main_text: params["last.address"],
            secondary_text: params["last.short_address"],
          },
        });

        // focus to the first transit if the first transit is empty
        if (pickup === null) setFocusedTransit("first");
      }
    }
  }

  /**
   * @typedef {object} Params
   * @property {string} "first.placeId"
   * @property {string} "first.address"
   * @property {string} "last.placeId"
   * @property {string} "last.address"
   *
   * @param {Params} params
   */

  function handleRedirectToConfirm(payload) {
    payload["first.latitude"] = params?.[`first.${payload["first.placeId"]}.latitude`]; // prettier-ignore
    payload["first.longitude"] = params?.[`first.${payload["first.placeId"]}.longitude`]; // prettier-ignore
    payload["last.latitude"] = params?.[`last.${payload["last.placeId"]}.latitude`]; // prettier-ignore
    payload["last.longitude"] = params?.[`last.${payload["last.placeId"]}.longitude`]; // prettier-ignore

    router.navigate({
      pathname: "match",
      params: payload,
    });

    Keyboard.dismiss();
    setFocusedTransit("");
  }

  /** @param {Location} location  */
  function handleSelectSuggestion(location) {
    if (focusedTransit === "first") {
      handleSetPickUp(location);

      // focus to the first transit if the first transit is empty
      if (dropoff === null) setFocusedTransit("last");
    } else {
      handleSetDropOff(location);

      // focus to the last transit if the last transit is empty
      if (pickup === null) setFocusedTransit("first");
    }

    setQ("");
  }

  /** @param {string} text */
  function handleChangePickUpText(text) {
    // reset the value if the user updates the pickup text
    if (pickup) handleSetPickUp(null);

    setQ(text);
  }

  /** @param {string} text */
  function handleChangeDropOffText(text) {
    // reset the value if the user updates the pickup text
    if (dropoff) handleSetDropOff(null);

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

  function handleClearPickUp() {
    setPickUp(null);
    router.setParams({
      "first.placeId": "",
      "first.address": "",
    });
  }

  function handleClearDropOff() {
    setDropOff(null);
    router.setParams({
      "last.placeId": "",
      "last.address": "",
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
            onFocus={() => setQ("")}
            isActive={focusedTransit === "first"}
            onPress={() => setFocusedTransit("first")}
            onClear={handleClearPickUp}
            onChangeText={handleChangePickUpText}
            overwriteValue={pickup?.description}
            onPressPin={() => handleRedirectToPin("first")}
            showPinOption={focusedTransit === "first" && params.locations === "true"} // prettier-ignore
          />

          <TransitItem
            placeholder="Going to?"
            onFocus={() => setQ("")}
            isActive={focusedTransit === "last"}
            onPress={() => setFocusedTransit("last")}
            onClear={handleClearDropOff}
            onChangeText={handleChangeDropOffText}
            overwriteValue={dropoff?.description}
            onPressPin={() => handleRedirectToPin("last")}
            showPinOption={focusedTransit === "last" && params.locations === "true"} // prettier-ignore
          />
        </View>
      </View>

      <TouchableWithoutFeedback
        style={{ flex: 1 }}
        onPress={() => {
          Keyboard.dismiss();
          setFocusedTransit("");
        }}
        accessible={false}
      >
        <View style={{ flex: 1 }}>
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
      </TouchableWithoutFeedback>
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
