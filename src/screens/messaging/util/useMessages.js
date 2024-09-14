import { useLocalSearchParams } from "expo-router";
import { useRef, useEffect } from "react";
import OrderedMap from "../../../services/ordered-map";
import useOnUpdate from "../../../services/hooks/useOnUpdate";
import log from "../../../services/log";
import useIncomingMessages from "./useIncomingMessages";
import storage from "../../../services/storage";

/**
 * @returns {UseMessageReturnType}
 */
export default function useMessages({ onIncomingMessage }) {
  const params = useLocalSearchParams();

  const messageMap = useRef(new OrderedMap());

  const incomingMessage = useIncomingMessages(params?.transit);

  useOnUpdate(handleAddIncomingMessage, [incomingMessage]);

  useEffect(() => {
    // retrieve the message from local storage
    const cacheMessages = storage.getString(`matches.${params?.transit}.messages`); // prettier-ignore
    const retrievedMessages = JSON.parse(cacheMessages || "{}");

    if (Object.keys(retrievedMessages).length > 0) {
      if (messageMap?.current?.size?.() === 0) {
        Object.keys(retrievedMessages).forEach((key) => {
          messageMap?.current.addToEnd(key, retrievedMessages[key]);
        });
      }
    }

    return () => {
      // store the messages in the local storage
      let messages = {};
      if (messageMap?.current) {
        messageMap?.current?.forEach((key, value) => {
          messages[key] = value;
        });
      }

      storage.set(
        `matches.${params?.transit}.messages`,
        JSON.stringify(messages)
      );
    };
  }, []);

  function handleAddIncomingMessage() {
    if (incomingMessage) {
      handleAddMessage(incomingMessage);
      onIncomingMessage?.();
    }
  }

  function handleAddMessage(message) {
    if (!message.clientRef) return;

    if (!messageMap.current.get(message.clientRef)) {
      messageMap.current.addToEnd(message.clientRef, message);
      log.debug("Added message to map.", message);
    } else {
      log.debug("Message already exists in the map.", message);
    }
  }

  return {
    messages: messageMap?.current,
    handleAddMessage,
  };
}

/**
 * @typedef Messages
 * @property {string} _id
 * @property {string} createdAt
 * @property {string} message
 * @property {string} senderId
 * @property {string} transit
 * @property {string} matchId
 * @property {string} clientRef
 * @property {string} driverProfileId
 *
 *
 * @typedef UseMessageReturnType
 * @property {Messages[]} messages
 * @property {(message: Messages) => void} handleAddMessage
 */
