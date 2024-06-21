import { useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Text from "../../components/text";
import Cta from "../../components/cta";
import { useSegments } from "expo-router";
import log from "../log";

export default function Provider() {
  const segments = useSegments();
  const [incomingMessage, setIncomingMessage] = useState();

  function handleClose() {
    setIncomingMessage("");
  }

  // todo: listen to incoming message here.
  // if user is not in message screen upon receiving incoming message
  const isInMessageScreen = segments.includes("messaging");
  // show the message prompt

  if (isInMessageScreen) return null;
  if (!incomingMessage) return null;

  log.debug("Showing incoming message prompt.", { incomingMessage });

  return (
    <View style={styles.promptContainer}>
      <View style={styles.content}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingVertical: 16,
            paddingHorizontal: 16,
            borderColor: "#EAEAEA",
            borderBottomWidth: 1,
          }}
        >
          <View
            style={{
              width: 55,
              height: 55,
              backgroundColor: "#f3f4f6",
              borderRadius: 9,
            }}
          />
          <Text weight="700" size={18} color="#363F59">
            Tom Hedge
          </Text>
        </View>
        <View style={{ padding: 16 }}>
          <Text color="#707070">{incomingMessage}</Text>

          <View style={{ marginTop: 16 }} />

          <Cta onPress={handleClose} color="transparent" textColor="#D1D5DB">
            Close
          </Cta>

          <Cta onPress={() => {}} color="#6366F1">
            Reply
          </Cta>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  promptContainer: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    position: "absolute",
    justifyContent: "flex-end",
    backgroundColor: "#00000032",
  },
  content: {
    backgroundColor: "white",
  },
});
