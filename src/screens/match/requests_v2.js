import { useState, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import {
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  ToastAndroid,
  ActivityIndicator,
} from "react-native";
import Text from "../../components/text";
import { Image } from "expo-image";
import {
  first as firstIcon,
  last as lastIcon,
  radioOn,
  radioOff,
  info,
  checkboxJoyRide,
  checkboxAngkas,
  checkboxMoveIt,
} from "../../services/images/remote";
import Cta from "../../components/cta";
import { useMMKVString } from "react-native-mmkv";
import useGetEstimate from "../../services/queries/useGetEstimate";
import Optional from "../../components/optional";
import { useRouter } from "expo-router";
import { decimal } from "../../services/util/amount";

export default function Find() {
  const router = useRouter();
  const noteRef = useRef("");

  const [addTip, setAddTip] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [matchDraft] = useMMKVString("match.draft");

  const [selectedPlatforms, setSelectedPlatforms] = useState([
    "AngkasPassenger",
    "JoyRideMcTaxi",
    "MoveItMotoTaxi",
  ]);

  const match = JSON.parse(matchDraft || "{}");
  const first = match?.first;
  const last = match?.last;

  const origin = `${first?.latitude},${first?.longitude}`;
  const destination = `${last?.latitude},${last?.longitude}`;

  const { data: angkasPassenger, isLoading: isLoadingAngkas } = useGetEstimate("AngkasPassenger", origin, destination); // prettier-ignore
  const { data: joyRideMcTaxi, isLoading: isLoadingJoyRide } = useGetEstimate("JoyRideMcTaxi", origin, destination); // prettier-ignore
  const { data: moveItMotoTaxi, isLoading: isLoadingMoveIt } = useGetEstimate("MoveItMotoTaxi", origin, destination); // prettier-ignore

  let minFare = undefined;
  let maxFare = undefined;

  const fares = [];

  if (selectedPlatforms.includes("AngkasPassenger")) {
    fares.push(angkasPassenger?.fare?.minFare);
    fares.push(angkasPassenger?.fare?.maxFare);
  }

  if (selectedPlatforms.includes("JoyRideMcTaxi")) {
    fares.push(joyRideMcTaxi?.fare?.minFare);
    fares.push(joyRideMcTaxi?.fare?.maxFare);
  }

  if (selectedPlatforms.includes("MoveItMotoTaxi")) {
    fares.push(moveItMotoTaxi?.fare?.minFare);
    fares.push(moveItMotoTaxi?.fare?.maxFare);
  }

  fares.forEach((num, index) => {
    // loop
    if (index === 0) {
      minFare = num;
      maxFare = num;

      return;
    }

    if (num < minFare) minFare = num;
    if (num > maxFare) maxFare = num;
  });

  function handleSelectPlatform(platform) {
    if (selectedPlatforms.includes(platform)) {
      if (selectedPlatforms.length === 1) {
        ToastAndroid.show("You must select at least one platform.", 100);
        return;
      }

      setSelectedPlatforms((prev) => prev.filter((p) => p !== platform));
    } else {
      setSelectedPlatforms((prev) => [...prev, platform]);
    }
  }

  function handleOnPressFirstLocation() {
    router.navigate({
      pathname: "/transit/search/first",
      params: {
        shortAddress: match?.first?.shortAddress,
        latitude: match?.first?.latitude,
        longitude: match?.first?.longitude,
        isFromMatchRequest: 1,
      },
    });
  }

  function handleOnPressLastLocation() {
    router.push({
      pathname: "/transit/search/last",
      params: {
        shortAddress: match?.last?.shortAddress,
        latitude: match?.last?.latitude,
        longitude: match?.last?.longitude,
        isFromMatchRequest: 1,
      },
    });
  }

  const isAngkasSelected =
    selectedPlatforms.includes("AngkasPassenger") || isLoadingAngkas;

  const isJoyRideSelected =
    selectedPlatforms.includes("JoyRideMcTaxi") || isLoadingJoyRide;

  const isMoveItSelected =
    selectedPlatforms.includes("MoveItMotoTaxi") || isLoadingMoveIt;

  return (
    <>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollViewContainer}
        style={styles.scrollView}
      >
        <TouchableOpacity onPress={handleOnPressFirstLocation}>
          <View style={{ flexDirection: "row", paddingVertical: 16, gap: 16 }}>
            <Image
              style={{ width: 34, height: 34 }}
              cachePolicy="memory-disk"
              resizeMode="contain"
              source={firstIcon}
            />
            <View style={{ gap: 8, flex: 1 }}>
              <Text size={18} weight="bold" color="#1B1B1B">
                {first?.shortAddress}
              </Text>
              <Text size={14} color="#707070">
                {first?.longAddress}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleOnPressLastLocation}>
          <View style={{ flexDirection: "row", paddingVertical: 16, gap: 16 }}>
            <Image
              style={{ width: 34, height: 34 }}
              cachePolicy="memory-disk"
              resizeMode="contain"
              source={lastIcon}
            />
            <View style={{ gap: 8, flex: 1 }}>
              <Text size={18} weight="bold" color="#1B1B1B">
                {last?.shortAddress}
              </Text>
              <Text size={14} color="#707070">
                {last?.longAddress}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={{ gap: 16, marginTop: 16 }}>
          <Text size={18} weight="bold" color="#1B1B1B">
            Notes to Driver
          </Text>

          <TextInput
            onChangeText={(text) => (noteRef.current = text)}
            multiline
            maxLength={1000}
            autoFocus={false}
            style={styles.textInput}
            placeholder="Leave a note to the driver"
          />
        </View>

        <View style={{ gap: 16, marginTop: 16 }}>
          <Text size={18} weight="bold" color="#1B1B1B">
            Preferred Mode of Payment
          </Text>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <Chip
              active={paymentMethod === "CASH"}
              onPress={() => setPaymentMethod("CASH")}
            >
              Cash
            </Chip>
            <Chip
              active={paymentMethod === "E_WALLET"}
              onPress={() => setPaymentMethod("E_WALLET")}
            >
              E-Wallet
            </Chip>
            <Chip
              active={paymentMethod === "PLATFORM_WALLET"}
              onPress={() => setPaymentMethod("PLATFORM_WALLET")}
            >
              Platform Wallet
            </Chip>
          </View>
        </View>

        <View style={styles.tipContainer}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Text size={18} weight="bold" color="#1B1B1B">
              Going to add tip?
            </Text>

            <TouchableOpacity>
              <Image
                style={{ width: 20, height: 20 }}
                cachePolicy="memory-disk"
                source={info}
              />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text weight="bold" color={addTip ? "#6366F1" : "#1B1B1B"}>
              {addTip ? "Yes" : "No"}
            </Text>
            <TouchableOpacity onPress={() => setAddTip((prev) => !prev)}>
              <Image
                style={{ width: 40, height: 40 }}
                cachePolicy="memory-disk"
                source={addTip ? radioOn : radioOff}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ gap: 16, marginTop: 24 }}>
          <Text size={18} weight="bold" color="#1B1B1B">
            Select Platform
          </Text>

          <View style={{ gap: 16 }}>
            <TouchableOpacity
              onPress={() => handleSelectPlatform("JoyRideMcTaxi")}
              style={{
                opacity: isJoyRideSelected ? 1 : 0.7,
              }}
            >
              <View style={[styles.platformOption, styles.joyRidePlatform]}>
                <View style={styles.platformContent}>
                  <View style={styles.checkbox}>
                    <Optional condition={isJoyRideSelected}>
                      <Image
                        source={checkboxJoyRide}
                        cachePolicy="memory-disk"
                        style={{ width: 18, height: 18 }}
                      />
                    </Optional>
                  </View>
                  <View style={{ gap: 4 }}>
                    <Text size={18} weight="bold" color="white">
                      JoyRide
                    </Text>
                    <Text size={16} color="white">
                      MC Taxi
                    </Text>
                  </View>
                </View>
                <Optional
                  fallback={<ActivityIndicator color="white" size="large" />}
                  condition={isLoadingJoyRide === false}
                >
                  <Text size={22} color="white">
                    P {decimal.format(joyRideMcTaxi?.fare?.minFare || 0)} -{" "}
                    {decimal.format(joyRideMcTaxi?.fare?.maxFare || 0)}
                  </Text>
                </Optional>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSelectPlatform("AngkasPassenger")}
              style={{
                opacity: isAngkasSelected ? 1 : 0.7,
              }}
            >
              <View style={[styles.platformOption, styles.angkasPlatform]}>
                <View style={styles.platformContent}>
                  <View style={styles.checkbox}>
                    <Optional condition={isAngkasSelected}>
                      <Image
                        style={{ width: 18, height: 18 }}
                        cachePolicy="memory-disk"
                        source={checkboxAngkas}
                      />
                    </Optional>
                  </View>
                  <View style={{ gap: 4 }}>
                    <Text size={18} weight="bold" color="white">
                      Angkas
                    </Text>
                    <Text size={16} color="white">
                      Passenger
                    </Text>
                  </View>
                </View>
                <Optional
                  fallback={<ActivityIndicator color="white" size="large" />}
                  condition={isLoadingAngkas === false}
                >
                  <Text size={22} color="white">
                    P {decimal.format(angkasPassenger?.fare?.minFare || 0)} -{" "}
                    {decimal.format(angkasPassenger?.fare?.maxFare || 0)}
                  </Text>
                </Optional>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSelectPlatform("MoveItMotoTaxi")}
              style={{
                opacity: isMoveItSelected ? 1 : 0.7,
              }}
            >
              <View style={[styles.platformOption, styles.moveItPlatform]}>
                <View style={styles.platformContent}>
                  <View style={styles.checkbox}>
                    <Optional condition={isMoveItSelected}>
                      <Image
                        style={{ width: 18, height: 18 }}
                        cachePolicy="memory-disk"
                        source={checkboxMoveIt}
                      />
                    </Optional>
                  </View>
                  <View style={{ gap: 4 }}>
                    <Text size={18} weight="bold" color="white">
                      Move It
                    </Text>
                    <Text size={16} color="white">
                      Moto Taxi
                    </Text>
                  </View>
                </View>

                <Optional
                  fallback={<ActivityIndicator color="white" size="large" />}
                  condition={isLoadingMoveIt === false}
                >
                  <Text size={22} color="white">
                    P {decimal.format(moveItMotoTaxi?.fare?.minFare || 0)} -{" "}
                    {decimal.format(moveItMotoTaxi?.fare?.maxFare || 0)}
                  </Text>
                </Optional>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ marginTop: 120, gap: 16 }}>
          <Optional condition={fares.length > 0}>
            <Text textAlign="center" size={34} weight="bold" color="#353579">
              P {decimal.format(minFare || 0)} - {decimal.format(maxFare || 0)}
            </Text>
          </Optional>

          <View style={{ paddingHorizontal: 24 }}>
            <Text textAlign="center" size={11} color="#707070">
              This estimation is based on price regulated by LTFB. Estimated
              fare may vary in the actual trip in the application you chose.
            </Text>
          </View>

          <Cta onPress={() => {}} color="#6366F1">
            Request a Ride
          </Cta>
        </View>
      </ScrollView>
    </>
  );
}

function Chip({ children, active, onPress }) {
  let activeStyle = styles.chipInactive;
  if (active) activeStyle = styles.chipActive;

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.chip, activeStyle]}>
        <Text weight="bold" color="white">
          {children}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollViewContainer: {
    padding: 16,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: "white",
  },
  textInput: {
    backgroundColor: "#fafafa",
    borderRadius: 26,
    padding: 24,
    height: 120,
    fontFamily: "Lato-Regular",
    fontSize: 16,
    textAlignVertical: "top",
    color: "#707070",
  },
  tipContainer: {
    gap: 16,
    marginTop: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  platformOption: {
    height: 100,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 24,
  },
  platformContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  angkasPlatform: {
    backgroundColor: "#0090F9",
  },
  joyRidePlatform: {
    backgroundColor: "#171ACB",
  },
  moveItPlatform: {
    backgroundColor: "#EF4444",
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
  },
  chipActive: {
    backgroundColor: "#6366F1",
  },
  chipInactive: {
    backgroundColor: "#CFD0FF",
  },
});
