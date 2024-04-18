import { Stack, useGlobalSearchParams } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from "react-native";
import supabase from "../../services/supabase";
import { useEffect, useRef, useState } from "react";
import Message from "./util/Message";
import { useUser } from "@clerk/clerk-expo";
import useIncomingMessage from "./util/useIncomingMessage";
import OrderedMap from "../../services/ordered-map";
import useOnUpdate from "../../services/hooks/useOnUpdate";
import moment from "moment";

const messageMap = new OrderedMap();

export default function Messaging() {
  const user = useUser();
  const [, toggleState] = useState(false);

  const refValue = useRef("");
  const refInput = useRef(null);
  const global = useGlobalSearchParams();

  const incomingMessage = useIncomingMessage(global.transit);
  useOnUpdate(handleAddIncomingMessage, [incomingMessage]);
  useEffect(handleGetMessages, []);

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

    // send message to client
    handleAddMessage(message);

    handleClearSetInput();
    handleManualRerender();
  };

  const handleChangeText = (v) => {
    refValue.current = v;
  };

  function handleManualRerender() {
    toggleState((state) => !state);
  }

  function handleAddIncomingMessage() {
    if (incomingMessage) {
      handleAddMessage(incomingMessage);
      handleManualRerender();
    }
  }

  async function handleGetMessages() {
    const messages = await handleRetrieveMessages(global?.transit);
    console.debug("Retrieved messages from server.", messages);
    messages.forEach((message) => handleAddMessage(message));
    handleManualRerender();
  }

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

          <View style={styles.spacer} />

          <View style={{ gap: 8 }}>
            {messageMap.map((key, value) => {
              return (
                <View key={key}>
                  <Text style={styles.sender}>
                    {moment(value.created_at).fromNow()}
                  </Text>
                  <Text style={styles.message}>{value.message}</Text>
                </View>
              );
            })}
          </View>
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

function handleAddMessage(message) {
  if (!messageMap.get(message.id)) {
    messageMap.addToEnd(message.id, message);
    console.debug("Added message to map.", message);
  } else {
    console.debug("Message already exists in the map.", message);
  }
}

/** @param {string} transit  */
async function handleRetrieveMessages(transit) {
  if (!transit) return [];

  console.debug("Retrieving messages");

  const { data, error } = await supabase
    .from("msg")
    .select("*")
    .eq("transit", transit);

  if (error) {
    console.error("An error occurred while retrieving messages.", error);
    return [];
  }

  return data || [];
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
  sender: {
    color: "gray",
  },
  message: {
    fontSize: 16,
    fontWeight: "600",
  },
  spacer: {
    padding: 8,
  },
});
