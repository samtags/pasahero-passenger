import { useState, useEffect, useRef } from "react";
import {
  RTCPeerConnection,
  mediaDevices,
  RTCIceCandidate,
  RTCSessionDescription,
} from "react-native-webrtc";
import InCallManager from "react-native-incall-manager";
import db from "../firebase/db";
import { handleClearRoom, handleGetRoomData } from "./useDial";
import RNCallKeep from "react-native-callkeep";
import { Alert, Linking } from "react-native";
import { router } from "expo-router";

export default function useJoin(roomId) {
  const peerConnectionRef = useRef(null);
  const sessionIdRef = useRef();
  const [userStream, setUserStream] = useState();
  const [streams, setStreams] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState("CONNECTING");
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  useEffect(() => {
    const subscriptions = [];

    (async () => {
      await RNCallKeep.setup({
        android: {
          selfManaged: false,
          alertTitle: "Allow incoming calls?",
          alertDescription:
            "This permission is require to receive incoming call from the passengers.",
          okButton: "Allow",
        },
      });

      const userStream = await mediaDevices
        .getUserMedia({
          audio: true,
        })
        .catch(() => {
          handleHangup();
          Alert.alert("Permission required", "Please allow microphone access", [
            {
              text: "OK",
              onPress: () => {
                // redirect to the settings page
                Linking.openSettings();
                router.back();
              },
            },
          ]);
        });

      setUserStream(userStream);

      const roomRef = await db.collection("rooms").doc(roomId);
      const calleeCandidatesCollection = roomRef.collection("calleeCandidates");
      const roomSnapshot = await roomRef.get();

      sessionIdRef.current = roomSnapshot?.data?.()?.sessionId;

      const peerConnection = new RTCPeerConnection(configuration);

      // Add each track from the localStream to the RTCPeerConnection
      userStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, userStream);
      });

      // events
      peerConnection.onicecandidate = (e) => {
        if (!e.candidate) return;
        calleeCandidatesCollection.add(e.candidate.toJSON());
      };

      peerConnection.oniceconnectionstatechange = (e) => {
        if (peerConnection.iceConnectionState == "disconnected") {
          setStatus("TERMINATED");
          handleCloseMedia();
        }

        if (peerConnection?.iceConnectionState == "connected") {
          // other party is connected
          setStatus("CONNECTED");
        }
      };

      peerConnection.ontrack = (e) => {
        if (e?.streams) setStreams(e?.streams);
      };

      const offer = roomSnapshot.data().offer;
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer)); // prettier-ignore

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      await roomRef.update({ answer });

      subscriptions.push(
        roomRef.collection("callerCandidates").onSnapshot((snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            if (change.type === "added") {
              let data = change.doc.data();
              await peerConnection.addIceCandidate(new RTCIceCandidate(data));
            }
          });
        })
      );

      peerConnectionRef.current = peerConnection;
    })();

    return () => {
      subscriptions.forEach((subscription) => subscription());
    };
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

  async function handleHangUp() {
    const room = await handleGetRoomData(roomId);

    if (room) {
      if (room.sessionId === sessionIdRef.current) {
        handleClearRoom(roomId);
      }
    }

    handleCloseMedia();
    setStatus("DROPPED");
  }

  function handleToggleSpeaker() {
    if (isSpeakerOn) {
      // Turn off loudspeaker
      InCallManager.setSpeakerphoneOn(false);
    } else {
      // Turn on loudspeaker
      InCallManager.setSpeakerphoneOn(true);
    }
    setIsSpeakerOn(!isSpeakerOn);
  }

  return {
    peerConnectionRef,
    userStream,
    streams,
    isMuted,
    handleToggleMute,
    handleHangUp,
    status,
    isSpeakerOn,
    handleToggleSpeaker,
  };
}

const configuration = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};
