import React from "react";
import { StyleSheet, Button } from "react-native";

import { RTCView } from "react-native-webrtc";
import { useRouter } from "expo-router";
import useOnUpdate from "../../src/services/hooks/useOnUpdate";
import useDial from "../../src/services/hooks/useDialer";
import db from "../../src/services/firebase/db";

const roomId = "PasaHeRoom";

export default function CallScreen() {
  const router = useRouter();

  const { status, isMuted, handleToggleMute, userStream, streams } =
    useDial(roomId);

  useOnUpdate(() => {
    if (status === "TERMINATED") {
      handleEndCall();
    }
  }, [status]);

  function handleEndCall() {
    db.collection("rooms").doc(roomId).delete();
    router.back();
  }

  return (
    <>
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
