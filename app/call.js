import { Text, StyleSheet, Button, View, Alert } from "react-native";

import { RTCView } from "react-native-webrtc";

import useCall from "../src/services/hooks/useCall";
import { useLocalSearchParams, useRouter } from "expo-router";
import useOnUpdate from "../src/services/hooks/useOnUpdate";

const roomId = "PasaHeRoom";

export default function Call() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const callerId = params?.callerId;

  const {
    isMuted,
    status,
    userStream,
    handleToggleMute,
    streams,
    handleCloseMedia,
  } = useCall(callerId || roomId);

  function handleEndCall() {
    handleCloseMedia();
    router.back();
  }

  useOnUpdate(() => {
    if (status === "DISCONNECTED") {
      handleEndCall();
      Alert.alert("Call Ended", "Call was terminated by the receiver.");
    }
  }, [status]);

  return (
    <>
      <View style={{ alignItems: "center" }}>
        <Text>{status}</Text>
      </View>

      <Button color="#ef4444" title="End call" onPress={handleEndCall} />

      {userStream && (
        <Button
          color="#a3a3a3"
          title={isMuted ? "Unmute" : "Mute"}
          onPress={handleToggleMute}
        />
      )}

      {streams?.map((stream) => (
        <RTCView
          key={stream._id}
          style={styles.rtc}
          streamURL={stream && stream.toURL()}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  rtc: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});
