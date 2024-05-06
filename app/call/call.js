import React, { useState, useEffect, useRef } from "react";
import { Text, StyleSheet, Button, View, Alert } from "react-native";

import {
  RTCPeerConnection,
  RTCView,
  mediaDevices,
  RTCIceCandidate,
  RTCSessionDescription,
} from "react-native-webrtc";
import firebase from "@react-native-firebase/app";
import "@react-native-firebase/firestore";
import { useRouter } from "expo-router";

const app = firebase.app();
db = app.firestore();

const configuration = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

const roomId = "PasaHeRoom";

const subscriptions = [];

const pendingPeerCandidates = [];
let remoteDescriptionReady = false;

export default function CallScreen() {
  const router = useRouter();

  const peerConnectionRef = useRef(null);
  const [localStream, setLocalStream] = useState();
  const [streams, setStreams] = useState([]);

  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    startCall(roomId);

    return handleCleanUp;
  }, []);

  function handleUnsubscribe() {
    subscriptions.forEach((unsbcrb) => unsbcrb());
  }

  function handleCleanUp() {
    handleCloseMedia();
    handleUnsubscribe();
  }

  function handleCloseMedia() {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.getTransceivers().forEach((transceiver) => {
        transceiver.stop();
      });
      peerConnectionRef.current.close();
    }

    streams?.forEach((stream) => {
      stream.getTracks().forEach((track) => track.stop());
    });
  }

  async function handleRemoveRoom(id) {
    await db.collection("rooms").doc(id).delete();
  }

  function handleEndCall() {
    handleCloseMedia();
    setLocalStream();
    handleRemoveRoom(roomId);
    router.back();
  }

  const startCall = async (id) => {
    // delete room if existing
    await handleRemoveRoom(id);

    const newStream = await mediaDevices.getUserMedia({
      audio: true,
    });

    setLocalStream(newStream);

    const peerConnection = new RTCPeerConnection(configuration);

    // Add each track from the localStream to the RTCPeerConnection
    newStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, newStream);
    });

    const roomRef = await db.collection("rooms").doc(id);
    const callerCandidatesCollection = roomRef.collection("callerCandidates");

    peerConnection.onicecandidate = (e) => {
      if (!e?.candidate) return;
      callerCandidatesCollection.add(e.candidate.toJSON());
    };

    peerConnection.oniceconnectionstatechange = (e) => {
      if (peerConnection?.iceConnectionState == "disconnected") {
        Alert.alert("Call ended", "Call receiver ended the call.");
        handleEndCall();
      }

      if (peerConnection?.iceConnectionState == "connected") {
        // other party is connected
        Alert.alert("Answered", "Call receiver answered your call!");
      }
    };

    peerConnection.ontrack = (e) => {
      if (e?.streams) setStreams(e?.streams);
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    const roomWithOffer = { offer };
    await roomRef.set(roomWithOffer);

    const unsubs = roomRef.onSnapshot(async (snapshot) => {
      const data = snapshot.data();
      if (!peerConnection.currentRemoteDescription && data?.answer) {
        const rtcSessionDescription = new RTCSessionDescription(data?.answer);
        await peerConnection.setRemoteDescription(rtcSessionDescription);
        remoteDescriptionReady = true;

        // add the candidates when desciption is ready.
        if (pendingPeerCandidates.length) {
          pendingPeerCandidates.forEach((candidate) => {
            peerConnection.addIceCandidate(candidate);
          });
        }
      }
    });

    if (unsubs) subscriptions.push(unsubs);

    const unsubscribe = roomRef
      .collection("calleeCandidates")
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === "added") {
            let data = change.doc.data();

            // wait for the candidate description
            if (remoteDescriptionReady) {
              peerConnection.addIceCandidate(new RTCIceCandidate(data));
            } else {
              pendingPeerCandidates.push(new RTCIceCandidate(data));
            }
          }
        });
      });

    if (unsubscribe) subscriptions.push();

    peerConnectionRef.current = peerConnection;
  };

  const toggleMute = () => {
    console.log(localStream.getAudioTracks());

    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsMuted(!track.enabled);
    });
  };

  return (
    <>
      <Button color="#ef4444" title="End call" onPress={handleEndCall} />

      {localStream && (
        <Button
          color="#a3a3a3"
          title={isMuted ? "Unmute" : "Mute"}
          onPress={toggleMute}
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
  heading: {
    alignSelf: "center",
    fontSize: 30,
  },
  rtcview: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    margin: 5,
  },
  rtc: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  toggleButtons: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  callButtons: {
    padding: 10,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  buttonContainer: {
    margin: 5,
  },
});
