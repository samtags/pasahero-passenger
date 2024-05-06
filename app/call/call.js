import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Button } from "react-native";

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
import useOnUpdate from "../../src/services/hooks/useOnUpdate";

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

function useDial(roomId) {
  const peerConnectionRef = useRef(null);
  const [userStream, setUserStream] = useState();
  const [streams, setStreams] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState("CONNECTING");

  useEffect(() => {
    const subscriptions = [];
    const pendingPeerCandidates = [];
    let remoteDescriptionReady = false;

    (async () => {
      const roomRef = await db.collection("rooms").doc(roomId);
      const callerCandidatesCollection = roomRef.collection("callerCandidates");

      // clean up the room
      await db.collection("rooms").doc(roomId).delete();

      // create stream
      const userStream = await mediaDevices.getUserMedia({
        audio: true,
      });

      const peerConnection = new RTCPeerConnection(configuration);

      userStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, userStream);
      });

      peerConnection.onicecandidate = (e) => {
        if (!e?.candidate) return;
        callerCandidatesCollection.add(e.candidate.toJSON());
      };

      peerConnection.oniceconnectionstatechange = (e) => {
        if (peerConnection?.iceConnectionState == "disconnected") {
          // Alert.alert("Call ended", "Call receiver ended the call.");
          setStatus("TERMINATED");
          handleCloseMedia();
        }

        if (peerConnection?.iceConnectionState == "connected") {
          // other party is connected
          // Alert.alert("Answered", "Call receiver answered your call!");
          setStatus("CONNECTED");
        }
      };

      peerConnection.ontrack = (e) => {
        if (e?.streams) setStreams(e?.streams);
      };

      // todo: maybe move after the peer connection is made
      // make sure all media are attached before creating a offer
      // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createOffer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      const roomWithOffer = { offer };
      await roomRef.set(roomWithOffer);

      subscriptions.push(
        roomRef.onSnapshot(async (snapshot) => {
          const data = snapshot.data();
          if (!peerConnection.currentRemoteDescription && data?.answer) {
            const rtcSessionDescription = new RTCSessionDescription(
              data?.answer
            );
            await peerConnection.setRemoteDescription(rtcSessionDescription);
            remoteDescriptionReady = true;

            // add the candidates when desciption is ready.
            if (pendingPeerCandidates.length) {
              pendingPeerCandidates.forEach((candidate) => {
                peerConnection.addIceCandidate(candidate);
              });
            }
          }
        })
      );

      subscriptions.push(
        // todo: reuse roomRef with other document operations
        roomRef.collection("calleeCandidates").onSnapshot((snapshot) => {
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
        })
      );

      peerConnectionRef.current = peerConnection;
      setUserStream(userStream);
    })();

    return () => {
      // close the rtc connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.getTransceivers().forEach((transceiver) => {
          transceiver.stop();
        });
        peerConnectionRef.current.close();
      }

      // handle close media
      streams?.forEach((stream) => {
        stream.getTracks().forEach((track) => track.stop());
      });

      // handle unsubscribe to snapshot listeners
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
    // return handleCleanUp;
  }, []);

  // stream clean up
  useEffect(() => {
    if (streams.length) {
      return () => {
        streams?.forEach((stream) => {
          stream.getTracks().forEach((track) => track.stop());
        });
      };
    }
  }, [streams]);

  function handleToggleMute() {
    userStream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsMuted(!track.enabled);
    });
  }

  function handleCloseMedia() {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.getTransceivers().forEach((transceiver) => {
        transceiver.stop();
      });
      peerConnectionRef.current.close();
    }
  }

  function handleHangup() {
    //
  }

  return {
    userStream,
    streams,
    isMuted,
    handleToggleMute,
    peerConnectionRef,
    status,
  };
}
