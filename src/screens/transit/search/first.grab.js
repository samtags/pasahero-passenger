import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import SearchResult from "../../../components/locations/SearchResult";
import useDelayedValue from "../../../services/hooks/useDelayedValue";
import useAutoComplete from "../../../services/queries/useAutoComplete";
import useGrabAutoComplete from "../../../services/queries/useGrabAutoComplete";
import { useLocalSearchParams, useRouter } from "expo-router";
import storage from "../../../services/storage";
import getCoordinatesByPlaceId from "../../../services/api/getCoordinatesByPlaceId";
import log from "../../../services/log";
import LottieView from "lottie-react-native";
import Optional from "../../../components/optional";
import Cta from "../../../components/cta";
import { from, pinEntry } from "../../../services/images/remote";
import getGrabCoordinatesByPlaceId from "../../../services/api/getGrabCoordinatesByPlaceId";

export default function GrabTransitSearchFirstScreen() {
  const router = useRouter();
  const textInputRef = useRef(null);

  const params = useLocalSearchParams();
  const isFromMatchRequest = Boolean(params?.isFromMatchRequest);

  const [isModified, setIsModified] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const [q, setQ] = useState(() => params?.shortAddress ?? "");
  const debouncedInputValue = useDelayedValue(q, 750);
  const inputValue = isModified ? debouncedInputValue : "";

  const { data: autoCompleteResults = [], isPending: isPending } =
    useGrabAutoComplete(inputValue);

  function handleChangeText(text) {
    setIsModified(true);
    setQ(text);
  }

  useEffect(() => {
    log.debug("User is in Search Departure Screen.", { provider: "Grab" });

    if (isModified === false) {
      textInputRef.current.blur();

      setTimeout(() => {
        textInputRef.current.focus();
      }, 150);
    }
  }, []);

  function handleConfirm() {
    router.replace("/match/request");
  }

  function handleSelect(item) {
    log.info("User select departure location.", {
      item,
      provider: "Grab",
      actionType: "tap",
    });

    getGrabCoordinatesByPlaceId(item?.PlaceId)
      .then((res) => {
        log.debug("Got coordinates by place id.", {
          response: res,
          provider: "Grab",
        });

        handleSetTransitFirst({
          latitude: res?.Place?.Geometry?.Point[1],
          longitude: res?.Place?.Geometry?.Point[0],
          shortAddress: item?.structured_formatting?.main_text,
          longAddress: item?.description,
        });

        log.debug("Redirecting user to the Request Ride screen.");
        router.replace("/match/request");

        // set location.current
        const newLocationRef = {
          latitude: res?.Place?.Geometry?.Point[1],
          longitude: res?.Place?.Geometry?.Point[0],
          shortAddress: item?.structured_formatting?.main_text,
          longAddress: item?.description,
        };

        storage.set("location.current", JSON.stringify(newLocationRef));
        log.debug(
          "Current location reference data is updated.",
          newLocationRef
        );
      })
      .catch((error) => {
        log.debug("Failed to get coordinates by place id", {
          error,
          provider: "Grab",
        });
      });
  }

  function handlePressPin() {
    if (isFromMatchRequest) {
      router.replace({
        pathname: "/transit/search/first.pin",
        params,
      });
    } else {
      const locationString = storage.getString("location.current");
      const location = JSON.parse(locationString);

      router.replace({
        pathname: "/transit/search/first.pin",
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      });
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heading}>
        <TouchableOpacity
          onPress={() => textInputRef?.current?.focus?.()}
          style={styles.inputContainer}
        >
          <Image
            style={styles.indicator}
            cachePolicy="memory-disk"
            source={from}
          />
          <TextInput
            ref={textInputRef}
            style={styles.textInput}
            onChangeText={handleChangeText}
            value={q}
            selection={isModified ? undefined : selection}
            onFocus={() => {
              if (isModified === false) setSelection({ start: 0, end: q.length }); // prettier-ignore
            }}
            placeholder="Search location"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePressPin} style={styles.pinButton}>
          <Image
            style={styles.pin}
            cachePolicy="memory-disk"
            source={pinEntry}
          />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.full}
        contentContainerStyle={styles.contentContainerStyle}
      >
        <Optional condition={isPending}>
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <LottieView
              autoPlay
              loop
              style={{
                width: 220,
                height: 220,
                marginTop: -64,
                marginBottom: -88,
              }}
              source={require("../../../assets/json/autocomplete-preloader.json")}
            />
          </View>
        </Optional>

        <Optional condition={isPending === false}>
          {autoCompleteResults?.map((item) => (
            <SearchResult
              key={item?.PlaceId}
              shortAddress={item?.structured_formatting?.main_text}
              longAddress={item?.description}
              onPress={() => handleSelect(item)}
            />
          ))}
        </Optional>
      </ScrollView>
      <Optional
        condition={isModified === false && isFromMatchRequest === false}
      >
        <View style={{ padding: 16 }}>
          <Cta onPress={handleConfirm} color="#6366F1">
            Confirm Pickup
          </Cta>
        </View>
      </Optional>
    </SafeAreaView>
  );
}

export function handleSetTransitFirst({
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

  draft.first = { latitude, longitude, shortAddress, longAddress };

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
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 36,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  indicator: { width: 14, height: 14 },
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
