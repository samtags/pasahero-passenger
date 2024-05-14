import { useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from "react-native";
import supabase from "../../services/supabase";
import { useCallback, useRef, useState } from "react";
import Message from "./util/Message";
import { useUser } from "@clerk/clerk-expo";
import useIncomingMessage from "./util/useIncomingMessage";
import OrderedMap from "../../services/ordered-map";
import useOnUpdate from "../../services/hooks/useOnUpdate";
import moment from "moment";
import log from "../../services/log";
import { Image } from "expo-image";
import Text from "../../components/text";

export default function Messaging() {
  const messageMap = useRef(new OrderedMap());

  const scrollViewRef = useRef();
  const user = useUser();
  const [, toggleState] = useState(false);

  const refValue = useRef("");
  const refInput = useRef(null);
  const params = useLocalSearchParams();

  const incomingMessage = useIncomingMessage(params.transit);
  useOnUpdate(handleAddIncomingMessage, [incomingMessage]);

  useFocusEffect(
    useCallback(() => {
      handleGetMessages().finally(() => {
        handleManualRerender();
        setTimeout(() =>
          scrollViewRef?.current?.scrollToEnd?.({ animated: false })
        );
      });
    }, [])
  );

  function handleClearSetInput() {
    refInput.current?.setNativeProps({ text: "" });
  }

  function handleBuildMessage() {
    const msg = new Message();
    msg.setMessage(refValue.current?.trim?.());
    msg.setSenderId(user?.user?.id);
    msg.setTransit(params?.transit ?? "/dev/null");
    return msg;
  }

  const handleSendMessage = () => {
    if (!refValue.current?.trim?.()) {
      toggleState();
      return;
    }
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
    const messages = await handleRetrieveMessages(params?.transit);
    console.log("🚀 ~ handleGetMessages ~ messages:", messages);
    log.debug("Retrieved messages from server.", { messages });
    messages.forEach((message) => handleAddMessage(message));
  }

  function handleAddMessage(message) {
    if (!messageMap.current.get(message.id)) {
      messageMap.current.addToEnd(message.id, message);
      log.debug("Added message to map.", { message });
    } else {
      log.debug("Message already exists in the map.", { message });
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ gap: 24, padding: 16 }}
      >
        {messageMap?.current.map((key, value) => {
          if (value.sender_id === user?.user?.id) {
            return (
              <SenderChat
                key={key}
                created_at={value.created_at}
                message={value.message}
              />
            );
          }

          return (
            <ReceiverChat
              key={key}
              created_at={value.created_at}
              message={value.message}
            />
          );
        })}
      </ScrollView>

      <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
        <View
          style={{
            backgroundColor: "#F0F0F0",
            height: 81,
            borderRadius: 10,
            padding: 16,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
          }}
        >
          <TextInput
            multiline
            ref={refInput}
            placeholder="Enter your message"
            onChangeText={handleChangeText}
            style={{ fontFamily: "Lato-Regular", fontSize: 16, flex: 1 }}
          />
          <TouchableOpacity
            style={{ alignSelf: "center" }}
            onPress={handleSendMessage}
          >
            <Image
              source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FSend.png?alt=media&token=3db4600b-40b0-4f4c-a0fe-e202e0ee9e15"
              cachePolicy="memory-disk"
              style={{
                width: 28,
                height: 28,
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function SenderChat(props) {
  return (
    <View style={{ alignItems: "flex-end", gap: 8 }}>
      <View
        style={{
          maxWidth: "80%",
          backgroundColor: "#6366F1",
          padding: 16,
          borderRadius: 29,
          borderBottomRightRadius: 0,
        }}
      >
        <Text size={17} textAlign="right" color="white">
          {props.message}
        </Text>
      </View>
      <Text size={14} textAlign="right" color="#6B7280">
        {moment(props.created_at).fromNow()}
      </Text>
    </View>
  );
}

function ReceiverChat(props) {
  return (
    <View style={{ gap: 8 }}>
      <View
        style={{
          maxWidth: "80%",
          backgroundColor: "#F3F4F4",
          padding: 16,
          borderRadius: 29,
          borderBottomLeftRadius: 0,
        }}
      >
        <Text style={styles.message}>{props.message}</Text>
      </View>
      <Text size={14} color="#6B7280">
        {moment(props.created_at).fromNow()}
      </Text>
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
    log.error("An error occurred while sending message to server.", { error });
    return;
  }

  log.debug("Message sent to server!");

  return data;
}

/** @param {string} transit  */
async function handleRetrieveMessages(transit) {
  if (!transit) return [];

  log.debug("Retrieving messages");

  const { data, error } = await supabase
    .from("msg")
    .select("*")
    .eq("transit", transit);

  if (error) {
    log.error("An error occurred while retrieving messages.", { error });
    return [];
  }

  return data || [];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
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
  textAlignRight: { textAlign: "right" },
});
