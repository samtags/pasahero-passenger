import { useLocalSearchParams, router } from "expo-router";
import { View, TouchableOpacity, StyleSheet, BackHandler } from "react-native";
import db from "../../services/firebase/db";
import { handleGetRoomData } from "../../services/hooks/useDial";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import Text from "../../components/text";
import { Image } from "expo-image";
import Optional from "../../components/optional";
import { answer, hangUp } from "../../services/images/remote";
import { IfFeatureEnabled, useFeatureIsOn } from "@growthbook/growthbook-react";
import Drop from "./components/drop";
import Pickup from "./components/pickup";

export default function Ring() {
  const params = useLocalSearchParams();

  const roomId = params?.roomId;
  const sessionId = params?.sessionId;

  const isEnhancementEnabled = useFeatureIsOn("messaging-enhancements");

  /*** @type {["CONNECTING" | "RINGING" | "TIMEOUT" | "CONNECTED" | "TERMINATED" | "DECLINED" | "DISCONNECTED"]} */
  const [state, setState] = useState("RINGING");

  useEffect(() => {
    if (roomId) {
      const unsubscribe = db
        .collection("rooms")
        .doc(roomId)
        .onSnapshot((doc) => {
          if (doc.exists) {
            const data = doc.data();
            if (sessionId === data?.sessionId) {
              setState(data.status);
            }
          }
        });

      return () => unsubscribe?.();
    }
  }, []);

  useEffect(() => {
    switch (state) {
      case "DISCONNECTED":
      case "TERMINATED":
      case "TIMEOUT":
      case "DECLINED":
        setTimeout(router.back, 1500);
        break;

      default:
        break;
    }
  }, [state]);

  useEffect(() => {
    const handleBackPress = () => true;
    BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
  }, []);

  const handleAccept = () => {
    router.replace({
      pathname: "/call/answer",
      params: {
        roomId,
      },
    });
  };

  const handleReject = async () => {
    const room = await handleGetRoomData(roomId);

    if (room.sessionId === sessionId) {
      await db.collection("rooms").doc(roomId).update({ status: "DECLINED" });
    }

    setTimeout(router.back, 1500);
  };

  const isRejected = ["DECLINED", "TIMEOUT", "TERMINATED", "DISCONNECTED"].includes(state); // prettier-ignore

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <LinearGradient
        style={styles.container}
        colors={["#65666A", "#292D33"]}
        end={{ x: 1, y: 1 }}
      >
        <View
          style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
        >
          <Optional condition={isRejected === false}>
            <Text size={21} color="white">
              Your driver is calling
            </Text>
          </Optional>
          <Optional condition={isRejected === true}>
            <Text size={21} color="white">
              Call Ended
            </Text>
          </Optional>
        </View>
        <Optional condition={isEnhancementEnabled === false}>
          <View style={{ paddingVertical: 56 }}>
            <View
              style={{
                gap: 108,
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <TouchableOpacity onPress={handleAccept}>
                <Image
                  source={answer}
                  style={{ width: 50, height: 50 }}
                  cachePolicy="memory-disk"
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleReject}>
                <Image
                  source={hangUp}
                  style={{ width: 50, height: 50 }}
                  cachePolicy="memory-disk"
                />
              </TouchableOpacity>
            </View>
          </View>
        </Optional>

        <IfFeatureEnabled feature="messaging-enhancements">
          <View style={styles.actionContainer}>
            <Drop label="Decline" onPress={handleReject} />

            <Pickup label="Answer" onPress={handleAccept} />
          </View>
        </IfFeatureEnabled>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 32,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 36,
  },
});
