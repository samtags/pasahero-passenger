import React, { useEffect } from "react";
import { StyleSheet, View, TouchableOpacity, BackHandler } from "react-native";
import { StatusBar } from "expo-status-bar";
import { RTCView } from "react-native-webrtc";

import { useRouter, useLocalSearchParams } from "expo-router";
import useJoin from "../../services/hooks/useJoin";
import useOnUpdate from "../../services/hooks/useOnUpdate";
import Text from "../../components/text";
import { Image } from "expo-image";
import Optional from "../../components/optional";
import { LinearGradient } from "expo-linear-gradient";
import useTimer from "../../services/hooks/useTimer";
import { hangUp, mute, unmute } from "../../services/images/remote";
import Drop from "./components/drop";
import Mute from "./components/mute";
import Speaker from "./components/speaker";
import { useFeatureIsOn, IfFeatureEnabled } from "@growthbook/growthbook-react";

export default function JoinScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const roomId = params?.roomId;
  const isEnhancementEnabled = useFeatureIsOn("messaging-enhancements");

  const {
    isMuted,
    handleToggleMute,
    userStream,
    status,
    streams,
    isSpeakerOn,
    handleToggleSpeaker,
    handleTerminate,
  } = useJoin(roomId);

  const timer = useTimer();

  useOnUpdate(() => {
    if (status === "TERMINATED") {
      setTimeout(router.back, 1500);
    }

    if (status === "CONNECTED") {
      timer.handleStart();
    }
  }, [status]);

  useEffect(() => {
    const handleBackPress = () => true;
    BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
  }, []);

  function handleEndCall() {
    handleTerminate();
    setTimeout(() => router.back(), 1500);
  }

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

          <Optional condition={status === "CONNECTED"}>
            <Text size={21} color="white">
              {timer.text}
            </Text>
          </Optional>

          <Optional condition={status === "DROPPED" || status === "TERMINATED"}>
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
              {userStream && (
                <TouchableOpacity onPress={handleToggleMute}>
                  <Image
                    source={!isMuted ? mute : unmute}
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
          </View>
        </Optional>

        {streams?.map((stream) => (
          <RTCView key={stream._id} streamURL={stream && stream.toURL()} />
        ))}

        <IfFeatureEnabled feature="messaging-enhancements">
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

            <Drop label="End" onPress={handleEndCall} />
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
