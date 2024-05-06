import {
  Text,
  StyleSheet,
  Button,
  View,
  Alert,
  SafeAreaView,
} from "react-native";

import { RTCView } from "react-native-webrtc";

import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import useDial from "../../services/hooks/useDial";
import useOnUpdate from "../../services/hooks/useOnUpdate";

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

  function handleEndCall() {
    handleHangup();
    setTimeout(() => router.back(), 1500);
  }

  useOnUpdate(() => {
    if (status === "TERMINATED") {
      Alert.alert("Call Ended", "Call was terminated by the receiver.");
      handleEndCall();
    }
  }, [status]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerShown: false,
          headerBackVisible: false,
        }}
      />
      <View style={{ paddingTop: 24, alignItems: "center" }}>
        <Text>
          {status[0]}
          {status.slice(1).toLowerCase()}
        </Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rtc: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});
