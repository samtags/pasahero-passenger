import { View, StyleSheet, TouchableOpacity, BackHandler } from "react-native";
import { RTCView } from "react-native-webrtc";
import { useEffect } from "react";

import { useLocalSearchParams, useRouter } from "expo-router";
import useDial from "../../services/hooks/useDial";
import useOnUpdate from "../../services/hooks/useOnUpdate";

import { LinearGradient } from "expo-linear-gradient";
import Text from "../../components/text";
import { Image } from "expo-image";
import Optional from "../../components/optional";
import { StatusBar } from "expo-status-bar";
import useTimer from "../../services/hooks/useTimer";
import { hangUp, mute, unmute } from "../../services/images/remote";
import { IfFeatureEnabled, useFeatureIsOn } from "@growthbook/growthbook-react";
import Drop from "./components/drop";
import Speaker from "./components/speaker";
import Mute from "./components/mute";
import storage from "../../services/storage";
import sendIncomingCallSignal from "../../services/api/sendIncomingCallSignal";

export default function Dial() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const roomId = params?.roomId;

  const isEnhancementEnabled = useFeatureIsOn("messaging-enhancements");

  const {
    isMuted,
    status,
    userStream,
    handleToggleMute,
    streams,
    handleHangup,
    isSpeakerOn,
    handleToggleSpeaker,
    sessionId,
  } = useDial(roomId);

  const timer = useTimer();

  function handleEndCall() {
    handleHangup();
    setTimeout(() => router.back(), 1500);
  }

  useOnUpdate(() => {
    if (status === "TERMINATED") {
      handleEndCall();
    }

    if (status === "REJECTED") {
      setTimeout(() => router.back(), 1500);
    }

    if (status === "CONNECTED") {
      timer.handleStart();
    }
  }, [status]);

  useEffect(() => {
    if (sessionId) {
      // send push notification that trigger the incoming call
      const firstName = storage.getString("user.firstName") ?? "";
      const lastName = storage.getString("user.lastName") ?? "";
      const displayName = `${firstName} ${lastName}`.trim();

      sendIncomingCallSignal({
        displayName,
        displayNumber: "PasaHero Passenger",
        sessionId,
        roomId,
      });
    }
  }, [sessionId]);

  useEffect(() => {
    const handleBackPress = () => true;
    BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
  }, []);

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
          <Optional condition={status === "CONNECTING"}>
            <Text size={21} color="white">
              Connecting
            </Text>
          </Optional>

          <Optional condition={status === "RINGING"}>
            <Text size={21} color="white">
              Ringing
            </Text>
          </Optional>

          <Optional condition={status === "CONNECTED"}>
            <Text size={21} color="white">
              {timer.text}
            </Text>
          </Optional>

          <Optional
            condition={["DROPPED", "REJECTED", "TERMINATED"].includes(status)}
          >
            <Text size={21} color="white">
              Call Ended
            </Text>
          </Optional>
        </View>
        <View style={{ paddingVertical: 56 }}>
          <Optional condition={isEnhancementEnabled === false}>
            <View
              style={{
                gap: 108,
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              {userStream && (
                <TouchableOpacity onPress={handleToggleMute}>
                  <Image
                    source={isMuted ? mute : unmute}
                    style={{ width: 50, height: 50 }}
                    cachePolicy="memory-disk"
                  />
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={handleEndCall}>
                <Image
                  source={hangUp}
                  style={{ width: 50, height: 50 }}
                  cachePolicy="memory-disk"
                />
              </TouchableOpacity>
            </View>
          </Optional>

          {streams?.map((stream) => (
            <RTCView
              key={stream._id}
              style={styles.rtc}
              streamURL={stream && stream.toURL()}
            />
          ))}
        </View>

        <IfFeatureEnabled feature="messaging-enhancements">
          <Optional condition={status === "RINGING" || status === "CONNECTING"}>
            <View style={styles.ringingAction}>
              <Drop onPress={handleEndCall} />
            </View>
          </Optional>
          <Optional condition={status === "CONNECTED"}>
            <View style={styles.actionContainer}>
              <Speaker
                label="Speaker"
                isActive={isSpeakerOn}
                onPress={handleToggleSpeaker}
              />

              <Optional condition={Boolean(userStream)}>
                <Mute
                  label="Mute"
                  isActive={isMuted}
                  onPress={handleToggleMute}
                />
              </Optional>

              <Drop onPress={handleEndCall} label="End" />
            </View>
          </Optional>
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
  ringingAction: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 36,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 36,
  },
});
