import { useState, useEffect, useRef } from "react";

import {
  RTCPeerConnection,
  mediaDevices,
  RTCIceCandidate,
  RTCSessionDescription,
} from "react-native-webrtc";
import db from "../firebase/db";
import uuidv4 from "../util/uuidv4";
import moment from "moment";

export default function useDial(roomId) {
  const peerConnectionRef = useRef(null);
  const sessionIdRef = useRef(null);
  const [userStream, setUserStream] = useState();
  const [streams, setStreams] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState("CONNECTING");

  useEffect(() => {
    const subscriptions = [];
    const pendingPeerCandidates = [];
    let remoteDescriptionReady = false;

    (async () => {
      const status = await handleCheckReceiverCallStatus();

      if (status === "BUSY") {
        setStatus("BUSY");
        return;
      }

      setStatus("RINGING");

      const { sessionId } = await handleCreateRoom(roomId);
      sessionIdRef.current = sessionId;

      const roomRef = await db.collection("rooms").doc(roomId);
      const callerCandidatesCollection = roomRef.collection("callerCandidates");

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

      // make sure all media are attached before creating a offer
      // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createOffer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      const roomWithOffer = { offer };
      await roomRef.update(roomWithOffer);

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

          if (data?.rejected) {
            handleCallRejected();
          }
        })
      );

      subscriptions.push(
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

  async function handleHangup() {
    const room = await handleGetRoomData(roomId);

    if (room) {
      if (room.sessionId === sessionIdRef.current) {
        handleClearRoom(roomId);
      }
    }

    handleCloseMedia();
    setStatus("DROPPED");
  }

  function handleCallRejected() {
    handleClearRoom(roomId);

    handleCloseMedia();
    setStatus("REJECTED");
  }

  return {
    userStream,
    streams,
    isMuted,
    peerConnectionRef,
    status,
    handleToggleMute,
    handleHangup,
  };
}

export async function handleGetRoomData(roomId) {
  try {
    const doc = await db.collection("rooms").doc(roomId).get();
    if (doc?.exists) return doc.data();
  } catch (err) {
    return undefined;
  }
}

/**
 * @param {string} roomId
 * @returns {"OK" | "BUSY"}
 */
async function handleCheckReceiverCallStatus(roomId) {
  const room = await handleGetRoomData(roomId);

  if (room) {
    if (Date.now() > room.validTill) return "BUSY";
    await handleClearRoom(roomId);
  }

  return "OK";
}

/**
 *
 * @param {string} userId
 */
export async function handleClearRoom(userId) {
  await db.collection("rooms").doc(userId).delete();
}

/**
 * @param {string} roomId
 */
async function handleCreateRoom(roomId) {
  const sessionId = uuidv4();
  const validTill = moment().add(15, "minutes").valueOf();

  await db.collection("rooms").doc(roomId).set({
    sessionId,
    validTill,
    showed: false,
  });

  return {
    sessionId,
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
