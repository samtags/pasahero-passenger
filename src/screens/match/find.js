import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import Text from "../../components/text";
import { Image } from "expo-image";
import {
  first,
  last,
  radioOn,
  radioOff,
  info,
  checkboxJoyRide,
  checkboxAngkas,
  checkboxMoveIt,
} from "../../services/images/remote";
import Cta from "../../components/cta";

export default function Find() {
  const [addTip, setAddTip] = useState(false);

  return (
    <>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollViewContainer}
        style={styles.scrollView}
      >
        <View style={{ flexDirection: "row", paddingVertical: 16, gap: 16 }}>
          <Image
            style={{ width: 30, height: 30 }}
            cachePolicy="memory-disk"
            source={first}
          />
          <View style={{ gap: 8, flex: 1 }}>
            <Text size={18} weight="bold" color="#1B1B1B">
              Salon for Herr and Frau
            </Text>
            <Text size={14} color="#707070">
              Unit 205, CIRQ Building, 1,1 L Sumulong Memorial Circle, Bgry San
              Roque, San Roque Antipolo
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", paddingVertical: 16, gap: 16 }}>
          <Image
            style={{ width: 30, height: 30 }}
            cachePolicy="memory-disk"
            source={last}
          />
          <View style={{ gap: 8, flex: 1 }}>
            <Text size={18} weight="bold" color="#1B1B1B">
              Salon for Herr and Frau
            </Text>
            <Text size={14} color="#707070">
              Unit 205, CIRQ Building, 1,1 L Sumulong Memorial Circle, Bgry San
              Roque, San Roque Antipolo
            </Text>
          </View>
        </View>

        <View style={{ gap: 16, marginTop: 16 }}>
          <Text size={18} weight="bold" color="#1B1B1B">
            Notes to Driver
          </Text>

          <TextInput
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
            <Chip active>Cash</Chip>
            <Chip>E-Wallet</Chip>
            <Chip>Platform Wallet</Chip>
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
            <TouchableOpacity>
              <View style={[styles.platformOption, styles.joyRidePlatform]}>
                <View style={styles.platformContent}>
                  <View style={styles.checkbox}>
                    <Image
                      source={checkboxJoyRide}
                      cachePolicy="memory-disk"
                      style={{ width: 18, height: 18 }}
                    />
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
                <Text size={22} color="white">
                  P 123 - 248
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity>
              <View style={[styles.platformOption, styles.angkasPlatform]}>
                <View style={styles.platformContent}>
                  <View style={styles.checkbox}>
                    <Image
                      style={{ width: 18, height: 18 }}
                      cachePolicy="memory-disk"
                      source={checkboxAngkas}
                    />
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
                <Text size={22} color="white">
                  P 123 - 248
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity>
              <View style={[styles.platformOption, styles.moveItPlatform]}>
                <View style={styles.platformContent}>
                  <View style={styles.checkbox}>
                    <Image
                      style={{ width: 18, height: 18 }}
                      cachePolicy="memory-disk"
                      source={checkboxMoveIt}
                    />
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
                <Text size={22} color="white">
                  P 123 - 248
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ marginTop: 120, gap: 16 }}>
          <Text textAlign="center" size={34} weight="bold" color="#353579">
            Php 314 - 415
          </Text>

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

function Chip({ children, active }) {
  let activeStyle = styles.chipInactive;
  if (active) activeStyle = styles.chipActive;

  return (
    <TouchableOpacity>
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
