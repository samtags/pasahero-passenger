import { useRouter, useLocalSearchParams } from "expo-router";
import { View, TouchableOpacity, StyleSheet } from "react-native";
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
  const router = useRouter();
  const params = useLocalSearchParams();

  const roomId = params?.roomId;
  const sessionId = params?.sessionId;

  const [isRejected, setIsRejected] = useState(false);
  const isEnhancementEnabled = useFeatureIsOn("messaging-enhancements");

  useEffect(() => {
    if (roomId) {
      const unsubscribe = db
        .collection("rooms")
        .doc(roomId)
        .onSnapshot((doc) => {
          if (doc.exists === false) {
            setIsRejected(true);
          }
        });

      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    if (isRejected) {
      const timer = setTimeout(router.back, 1500);
      return () => clearTimeout(timer);
    }
  }, [isRejected]);

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
      db.collection("rooms").doc(roomId).update({
        rejected: true,
      });
    }

    setIsRejected(true);
  };

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
