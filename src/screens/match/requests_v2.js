import { StackActions, CommonActions } from "@react-navigation/native";
import { useState, useRef, useEffect } from "react";
import {
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  ToastAndroid,
  ActivityIndicator,
  BackHandler,
  Alert,
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
import { useNavigation, useRouter } from "expo-router";
import { decimal } from "../../services/util/amount";
import { SignedOut, SignedIn, useOAuth, useUser } from "@clerk/clerk-expo";
import log from "../../services/log";
import { useMutation } from "@tanstack/react-query";
import findNearby from "../../services/api/findNearby";
import useOnUpdateSnapshot from "../../services/hooks/useOnUpdateSnapshot";
import storage from "../../services/storage";

export default function Find() {
  const user = useUser();
  const isFromAuth = useRef(false);
  const router = useRouter();
  const navigation = useNavigation();
  const noteRef = useRef("");
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const [services, setServices] = useState(preSelectedServices);
  const [willAddTip, setWillAddTip] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  const [matchDraft] = useMMKVString("match.draft");

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

  if (services.includes("AngkasPassenger")) {
    fares.push(angkasPassenger?.fare?.minFare);
    fares.push(angkasPassenger?.fare?.maxFare);
  }

  if (services.includes("JoyRideMcTaxi")) {
    fares.push(joyRideMcTaxi?.fare?.minFare);
    fares.push(joyRideMcTaxi?.fare?.maxFare);
  }

  if (services.includes("MoveItMotoTaxi")) {
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

  const minFareDisplay = decimal.format(minFare || 0);
  const maxFareDisplay = decimal.format(maxFare || 0);
  const estimatePreview = `${minFareDisplay} - ${maxFareDisplay}`;

  /**
   * prevent stacking of same screen in the navigation stack
   * resulting in a back button loop to the same screen
   * this usually happens when the user came from pin location screen
   */
  useEffect(() => {
    const routes = navigation.getState().routes;

    let hasDuplicate = false;
    let tmp = new Set();
    const newRoutes = [];

    routes.forEach((route) => {
      if (tmp.has(route.name)) {
        hasDuplicate = true;
        return;
      }

      tmp.add(route.name);
      newRoutes.push(route);
    });

    if (hasDuplicate) {
      navigation.dispatch(
        CommonActions.reset({
          index: newRoutes.length - 1,
          routes: newRoutes,
        })
      );
    }
  }, []);

  // prevent back button
  useEffect(() => {
    function handleBackButton() {
      return true;
    }

    BackHandler.addEventListener("hardwareBackPress", handleBackButton);

    return () => {
      BackHandler.removeEventListener("hardwareBackPress", handleBackButton);
    };
  }, []);

  useOnUpdateSnapshot(
    (prev, curr) => {
      if (!prev.user?.user && curr.user?.user) {
        if (isFromAuth.current === true) {
          handleOnConfirm();
        }
      }
    },
    { user }
  );

  const { isPending, mutateAsync: handleRequestRide } = useMutation({
    mutationFn: () => {
      const user_id = storage.getString("user.id");

      const payload = {
        user_id,
        services,
        estimatePreview,
        first_point: transformToApiField(match?.first),
        last_point: transformToApiField(match?.last),
        notes: noteRef.current,
        payment_method: paymentMethod,
        will_add_tip: willAddTip,
        fare: {
          minFare,
          maxFare,
          angkasPassenger,
          joyRideMcTaxi,
          moveItMotoTaxi,
        },
      };

      return findNearby(payload);
    },
  });

  function handleSelectPlatform(platform) {
    if (services.includes(platform)) {
      if (services.length === 1) {
        ToastAndroid.show("You must select at least one platform.", 100);
        return;
      }

      setServices((prev) => prev.filter((p) => p !== platform));
    } else {
      setServices((prev) => [...prev, platform]);
    }
  }

  function handleOnPressFirstLocation() {
    if (match?.first?.shortAddress?.toLowerCase?.() === "exact location") {
      router.navigate({
        pathname: "/transit/search/first.pin",
        params: {
          latitude: match?.first.latitude,
          longitude: match?.first.longitude,
          isFromMatchRequest: 1,
        },
      });
      return;
    }

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
    if (match?.last?.shortAddress?.toLowerCase?.() === "exact location") {
      router.navigate({
        pathname: "/transit/search/last.pin",
        params: {
          latitude: match?.last.latitude,
          longitude: match?.last.longitude,
          isFromMatchRequest: 1,
        },
      });
      return;
    }

    router.navigate({
      pathname: "/transit/search/last",
      params: {
        shortAddress: match?.last?.shortAddress,
        latitude: match?.last?.latitude,
        longitude: match?.last?.longitude,
        isFromMatchRequest: 1,
      },
    });
  }

  async function handleSignIn() {
    try {
      isFromAuth.current = true;
      const flow = await startOAuthFlow();

      const { createdSessionId, signUp, setActive } = flow;

      if (createdSessionId) {
        setActive({ session: createdSessionId });
      } else {
        setActive({ session: signUp.createdSessionId });
      }
    } catch (err) {
      log.error("OAuth error", { error: err });
      isFromAuth.current = false;
    }
  }

  function handleOnConfirm() {
    log.info('User tap "Request a Ride" button.', { actionType: "tap" });

    handleRequestRide()
      .then((res) => {
        navigation.dispatch(StackActions.popToTop());
        router.navigate({
          pathname: `match/${res?.id}`,
        });
      })
      .catch((err) => {
        Alert.alert(
          "Unable to proceed",
          "There was an error while requesting a ride. Please try again later."
        );
        log.error("Unable to proceed with request Ride", {
          error: err,
        });
      });
  }

  const isAngkasSelected =
    services.includes("AngkasPassenger") || isLoadingAngkas;

  const isJoyRideSelected =
    services.includes("JoyRideMcTaxi") || isLoadingJoyRide;

  const isMoveItSelected =
    services.includes("MoveItMotoTaxi") || isLoadingMoveIt;

  const disableSubmit = isPending || fares.length === 0;

  return (
    <>
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
            Preferred Payment Type
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
            <Text weight="bold" color={willAddTip ? "#6366F1" : "#1B1B1B"}>
              {willAddTip ? "Yes" : "No"}
            </Text>
            <TouchableOpacity onPress={() => setWillAddTip((prev) => !prev)}>
              <Image
                style={{ width: 40, height: 40 }}
                cachePolicy="memory-disk"
                source={willAddTip ? radioOn : radioOff}
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
                    P {joyRideMcTaxi?.fare?.estimatedPreview}
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
                    P {angkasPassenger?.fare?.estimatedPreview}
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
                    P {moveItMotoTaxi?.fare?.estimatedPreview}
                  </Text>
                </Optional>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ marginTop: 120, gap: 16 }}>
          <Optional condition={fares.length > 0}>
            <Text textAlign="center" size={34} weight="bold" color="#353579">
              P {estimatePreview}
            </Text>
          </Optional>

          <View style={{ paddingHorizontal: 24 }}>
            <Text textAlign="center" size={11} color="#707070">
              This estimation is based on price regulated by LTFB. Estimated
              fare may vary in the actual trip in the application you chose.
            </Text>
          </View>

          <SignedOut>
            <Cta
              disabled={disableSubmit}
              color={disableSubmit ? "#B9BAF9" : "#6366F1"}
              onPress={handleSignIn}
            >
              Sign in to Continue
            </Cta>
          </SignedOut>
          <SignedIn>
            <Cta
              onPress={handleOnConfirm}
              disabled={disableSubmit}
              color={disableSubmit ? "#B9BAF9" : "#6366F1"}
            >
              Request a Ride
            </Cta>
          </SignedIn>
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

const preSelectedServices = [
  "AngkasPassenger",
  "JoyRideMcTaxi",
  "MoveItMotoTaxi",
];

function transformToApiField(obj) {
  const data = { ...obj };

  data.short_address = obj.shortAddress;
  data.long_address = obj.longAddress;

  return data;
}
