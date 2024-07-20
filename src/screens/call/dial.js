import { View, StyleSheet, TouchableOpacity } from "react-native";
import { RTCView } from "react-native-webrtc";

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

export default function Dial() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const roomId = params?.roomId;

  const {
    isMuted,
    status,
    userStream,
    handleToggleMute,
    streams,
    handleHangup,
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
          <View
            style={{ gap: 108, flexDirection: "row", justifyContent: "center" }}
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

          {streams?.map((stream) => (
            <RTCView
              key={stream._id}
              style={styles.rtc}
              streamURL={stream && stream.toURL()}
            />
          ))}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({});
