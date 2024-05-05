import { Text, StyleSheet, Button, View } from "react-native";

import { RTCView } from "react-native-webrtc";

import useCall from "../src/services/hooks/useCall";

const roomId = "PasaHeRoom";

export default function CallScreen() {
  const { isMuted, status, userStream, handleToggleMute, streams } =
    useCall(roomId);

  return (
    <>
      <View style={{ alignItems: "center" }}>
        <Text>{status}</Text>
      </View>

      <Button color="#ef4444" title="End call" onPress={() => {}} />

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
