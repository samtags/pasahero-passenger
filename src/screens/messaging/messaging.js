import { Stack, useGlobalSearchParams } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import supabase from "../../services/supabase";
import { useRef } from "react";
import Message from "./util/Message";
import { useUser } from "@clerk/clerk-expo";

export default function Messaging() {
  const user = useUser();

  const refValue = useRef("");
  const refInput = useRef(null);
  const global = useGlobalSearchParams();

  function handleClearSetInput() {
    refInput.current?.setNativeProps({ text: "" });
  }

  function handleBuildMessage() {
    const msg = new Message();
    msg.setMessage(refValue.current);
    msg.setSenderId(user?.user?.id);
    msg.setTransit(global?.transit ?? "/dev/null");
    return msg;
  }

  const handleSendMessage = () => {
    const message = handleBuildMessage();

    // send to server
    sendMessage(message);

    // todo: send message to client

    handleClearSetInput();
  };

  const handleChangeText = (v) => {
    refValue.current = v;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Messaging",
        }}
      />

      <Text style={styles.title}>{global?.transit}</Text>
      <View style={styles.spacer}>
        <View style={styles.spacer}>
          <TextInput
            autoFocus
            multiline
            ref={refInput}
            placeholder="Enter your message"
            onChangeText={handleChangeText}
          />
          <View style={styles.spacer} />
          <TouchableOpacity onPress={handleSendMessage}>
            <Text style={{ fontWeight: "bold" }}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

async function sendMessage(message) {
  const { error, data } = await supabase //
    .from("msg")
    .upsert(message)
    .single();

  if (error) {
    // todo: send log to newrelic
    console.error("An error occurred while sending message to server.", error);
    return;
  }

  console.debug("Message sent to server!");

  return data;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "whitesmoke",
  },
  primary: {
    backgroundColor: "gainsboro",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  title: {
    color: "#38434D",
    marginVertical: 16,
    textAlign: "center",
  },
  spacer: {
    padding: 8,
  },
});
