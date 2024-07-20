import React from "react";
import { StyleSheet, View, Alert, TouchableOpacity } from "react-native";
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

export default function JoinScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const roomId = params?.roomId;

  const {
    isMuted,
    handleToggleMute,
    userStream,
    status,
    streams,
    handleHangUp,
  } = useJoin(roomId);

  const timer = useTimer();

  useOnUpdate(() => {
    if (status === "TERMINATED") {
      setTimeout(() => router.back(), 1500);
    }

    if (status === "CONNECTED") {
      timer.handleStart();
    }
  }, [status]);

  function handleEndCall() {
    handleHangUp();
    setTimeout(() => router.back(), 1500);
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <LinearGradient
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
        colors={["#242565", "#111023"]}
        end={{ x: 1, y: 1 }}
      >
        <View
          style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
        >
          <Optional condition={status === "CONNECTING"}>
            <Text size={21} color="white">
              Connecting...
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
        <View style={{ paddingVertical: 56 }}>
          <View
            style={{ gap: 108, flexDirection: "row", justifyContent: "center" }}
          >
            {userStream && (
              <TouchableOpacity onPress={handleToggleMute}>
                <Image
                  source={isMuted ? unmute : mute}
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
          {streams?.map((stream) => (
            <RTCView key={stream._id} streamURL={stream && stream.toURL()} />
          ))}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({});
