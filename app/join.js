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

export default function JoinScreen() {
  const router = useRouter();

  function handleUnsubscribe() {
    subscriptions.forEach((unsbcrb) => unsbcrb());
  }

  function handleRemoveRoom(id) {
    db.collection("rooms")
      .doc(id)
      .delete()
      .then(() => {
        console.log("Document successfully deleted!");
      })
      .catch((error) => {
        console.error("Error removing document: ", error);
      });
  }

  function handleDisconnect() {
    Alert.alert("Call Ended", "Caller terminated the call.");

    handleCloseMedia();
    setLocalStream();
    router.back();
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

  function handleCleanUp() {
    handleCloseMedia();
    handleUnsubscribe();
  }

  function handleEndCall() {
    handleCloseMedia();
    setLocalStream();
    handleRemoveRoom(roomId);
    router.back();
  }

  const peerConnectionRef = useRef(null);
  const [localStream, setLocalStream] = useState();
  const [streams, setStreams] = useState([]);

  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    startLocalStream();
    return handleCleanUp;
  }, []);

  useEffect(() => {
    if (localStream !== undefined) {
      joinCall(roomId);
    }
  }, [localStream]);

  const startLocalStream = async () => {
    const newStream = await mediaDevices.getUserMedia({
      audio: true,
    });
    setLocalStream(newStream);
  };

  const joinCall = async (id) => {
    const roomRef = await db.collection("rooms").doc(id);
    const roomSnapshot = await roomRef.get();

    if (!roomSnapshot.exists) return;
    const peerConnection = new RTCPeerConnection(configuration);

    // Add each track from the localStream to the RTCPeerConnection
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    const calleeCandidatesCollection = roomRef.collection("calleeCandidates");
    peerConnection.onicecandidate = (e) => {
      if (!e.candidate) return;
      calleeCandidatesCollection.add(e.candidate.toJSON());
    };

    peerConnection.oniceconnectionstatechange = (e) => {
      if (peerConnection.iceConnectionState == "disconnected") {
        handleDisconnect();
      }
    };

    peerConnection.ontrack = (e) => {
      if (e?.streams) setStreams(e?.streams);
    };

    const offer = roomSnapshot.data().offer;
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    const roomWithAnswer = { answer };
    await roomRef.update(roomWithAnswer);

    const unsubscribe = roomRef
      .collection("callerCandidates")
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === "added") {
            let data = change.doc.data();
            await peerConnection.addIceCandidate(new RTCIceCandidate(data));
          }
        });
      });

    if (unsubscribe) subscriptions.push();

    peerConnectionRef.current = peerConnection;
  };

  // Mutes the local's outgoing audio
  const toggleMute = () => {
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsMuted(!track.enabled);
    });
  };

  return (
    <>
      <Text style={styles.heading}>Join Screen</Text>
      <Text style={styles.heading}>Room : {roomId}</Text>

      <View style={styles.callButtons}>
        <View styles={styles.buttonContainer}>
          <Button title="End Call" onPress={handleEndCall} />
        </View>
      </View>

      <View style={styles.toggleButtons}>
        <Button title={isMuted ? "Unmute" : "Mute"} onPress={toggleMute} />
      </View>

      {localStream && (
        <RTCView
          style={styles.rtc}
          streamURL={localStream && localStream.toURL()}
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
