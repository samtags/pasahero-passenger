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
                  source={
                    isMuted
                      ? "https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FUnmute%20Call.png?alt=media&token=c3ad548f-32d2-4fba-ae1b-802923a7cf41"
                      : "https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FMute%20Call.png?alt=media&token=da54782a-004b-45d1-ac35-82255fa28c59"
                  }
                  style={{ width: 50, height: 50 }}
                  cachePolicy="memory-disk"
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={handleEndCall}>
              <Image
                source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FEnd%20Call.png?alt=media&token=b8157725-8b9b-488e-8441-4d21591dd566"
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
