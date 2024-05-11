import { useRouter } from "expo-router";
import {
  View,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import Text from "../../components/text";
import Cta from "../../components/cta";
import { Image } from "expo-image";
import { useRef, useState } from "react";
import useDelayedValue from "../../services/hooks/useDelayedValue";
import useAutoComplete from "../../services/queries/useAutoComplete";
import * as Location from "expo-location";
import { useMMKVString } from "react-native-mmkv";
import getCoordinatesByPlaceId from "../../services/api/getCoordinatesByPlaceId";
import log from "../../services/log";

export default function Setup() {
  const [_, setLocation] = useMMKVString("location.current");

  const router = useRouter();
  const textInputRef = useRef(null);

  const [selected, setSelected] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isGettingPlaceDetails, setIsGettingPlaceDetails] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const isButtonDisabled = isGettingLocation || !selected || isGettingPlaceDetails; // prettier-ignore

  const handleUseCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    const granted = status === "granted";

    if (!granted) {
      Alert.alert(
        "Permission required",
        "Please enable location permission to use your current location."
      );
      return;
    }

    setIsGettingLocation(true);

    const data = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
    }).catch(() => undefined);

    setIsGettingLocation(false);

    if (!data) {
      Alert.alert(
        "Oops!",
        "Unable to get your current location. Please try to use the search instead."
      );
      textInputRef?.current?.focus?.();
      return;
    }

    const latitude = data?.coords?.latitude;
    const longitude = data?.coords?.longitude;
    const heading = data?.coords?.heading;

    setLocation(JSON.stringify({ latitude, longitude, heading }));
    router.navigate("/");
  };

  const handleOnSetLocation = async () => {
    setIsGettingPlaceDetails(true);

    const result = await getCoordinatesByPlaceId(selected?.place_id).catch(
      (error) => {
        log.warn("Unable to get location details.", { error });
        return undefined;
      }
    );

    setIsGettingPlaceDetails(false);

    if (!result) {
      Alert.alert(
        "Oops!",
        "Unable to get location details to the selected location. Please try to search again."
      );

      return;
    }

    const latitude = result?.data?.result?.geometry?.location?.lat;
    const longitude = result?.data?.result?.geometry?.location?.lng;

    setLocation(JSON.stringify({ latitude, longitude }));
    router.navigate("/");
  };

  const [q, setQ] = useState("");
  const debouncedInput = useDelayedValue(q, 750);

  let autoCompleteInput = debouncedInput;

  if (selected?.description === q) autoCompleteInput = "";
  const { data: autoCompleteResults = [] } = useAutoComplete(autoCompleteInput);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="height" style={styles.content}>
        <View
          style={{ flexDirection: "row", paddingHorizontal: 16, marginTop: 16 }}
        >
          <View
            style={{
              backgroundColor: "#F0F0F0",
              borderRadius: 10,
              paddingVertical: 4.5,
              paddingLeft: 16,
              paddingRight: 36,
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Image
              style={{ width: 12, height: 12 }}
              cachePolicy="memory-disk"
              source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FOrigin.png?alt=media&token=7913bdfb-7b7f-41aa-aecb-433a275c92b8"
            />
            <TextInput
              selection={selected ? selection : undefined}
              onFocus={() => {
                setSelection({ start: 0, end: q.length });
              }}
              onBlur={() => {
                setSelection({ start: 0, end: 0 });
              }}
              ref={textInputRef}
              autoFocus
              style={{
                fontSize: 16,
                fontFamily: "Lato-Bold",
                color: "#1B1B1B",
              }}
              onChangeText={(text) => {
                setSelected(null);
                setQ(text);
              }}
              value={q}
              placeholder="Search location"
            />
          </View>
          <TouchableOpacity
            onPress={handleUseCurrentLocation}
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingLeft: 12,
            }}
          >
            <Image
              style={{ width: 22, height: 22 }}
              cachePolicy="memory-disk"
              source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FTarget.png?alt=media&token=d6c31afa-5308-43e8-a8cd-291cb7316009"
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
            <Prediction
              key={item?.place_id}
              shortAddress={item?.structured_formatting?.main_text}
              longAddress={item?.description}
              onPress={() => {
                setSelected(item);
                setQ(item?.description);
                setSelection({ start: 0, end: 0 });
              }}
            />
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
        <Cta
          onPress={handleOnSetLocation}
          disabled={isButtonDisabled}
          color={isButtonDisabled ? "#B9BAF9" : "#6366F1"}
        >
          Set Location
        </Cta>
      </View>
    </SafeAreaView>
  );
}

/**
 *
 * @param {PredictionProps} props
 */
function Prediction({ shortAddress, longAddress, onPress }) {
  return (
    <TouchableOpacity onPress={() => onPress?.()}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#EAEAEA",
        }}
      >
        <Image
          style={{ width: 24, height: 24 }}
          cachePolicy="memory-disk"
          source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FLocation.png?alt=media&token=d410e0c5-41d3-4a7a-a98e-333727a1820f"
        />

        <View style={{ gap: 6, flex: 1 }}>
          <Text numberOfLines={1} color="#1B1B1B" weight="bold" size={18}>
            {shortAddress}
          </Text>
          <Text numberOfLines={2} color="#707070" size={14}>
            {longAddress}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
    position: "relative",
  },
  content: {
    flex: 1,
  },
});

/**
 * @typedef PredictionProps
 * @property {string} shortAddress
 * @property {string} longAddress
 * @property {() => unknown} [onPress]
 */
