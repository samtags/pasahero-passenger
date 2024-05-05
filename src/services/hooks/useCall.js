import { useEffect, useRef, useState } from "react";

import {
  RTCPeerConnection,
  mediaDevices,
  RTCIceCandidate,
  RTCSessionDescription,
} from "react-native-webrtc";

import firebase from "@react-native-firebase/app";
import "@react-native-firebase/firestore";

import uuidv4 from "../util/uuidv4";
import moment from "moment";

const app = firebase.app();
const db = app.firestore();

/**
 *
 * @param {string} userId
 * @returns
 */
export default function useCall(userId) {
  const peerConnectionRef = useRef(null);

  const [userStream, setUserStream] = useState();
  const [streams, setStreams] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState("CONNECTING");

  function handleToggleMute() {
    userStream?.getAudioTracks?.()?.forEach((track) => {
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

    streams?.forEach((stream) => {
      stream.getTracks().forEach((track) => track.stop());
    });
  }

  useEffect(() => {
    let subscriptions = [];

    (async () => {
      const status = await handleCheckReceiverCallStatus();

      if (status === "BUSY") {
        setStatus("BUSY");
        return;
      }

      setStatus("RINGING");

      await handleCreateRoom(userId);
      const { peerConnection, offer, stream } = await handleSetupRtcPeerConnection(); // prettier-ignore

      setUserStream(stream);

      const { snapShotSubscription } = await handleEstablishConnection({
        userId,
        offer,
        peerConnection,
      });

      // listen to incoming tracks
      peerConnection.ontrack = (e) => {
        if (e?.streams) {
          setStreams(e?.streams);
        }
      };

      // listen to connection state changes
      peerConnection.oniceconnectionstatechange = (e) => {
        if (peerConnection?.iceConnectionState == "disconnected") {
          setStatus("DISCONNECTED");
        }

        if (peerConnection?.iceConnectionState == "connected") {
          setStatus("CONNECTED");
        }
      };

      peerConnectionRef.current = peerConnection;
      subscriptions = snapShotSubscription;
    })();

    return () => {
      subscriptions?.forEach((subscription) => subscription?.());
    };
  }, []);

  return {
    status,
    userStream,
    streams,
    isMuted,
    handleToggleMute,
    handleCloseMedia,
  };
}

async function handleEstablishConnection({ userId, offer, peerConnection }) {
  const subscriptions = [];
  const peerCandidates = [];
  let remoteDescriptionReady = false;

  const roomRef = await db.collection("rooms").doc(userId);
  const callerCandidatesCollection = roomRef.collection("callerCandidates");

  await roomRef.set({ offer });

  peerConnection.onicecandidate = (e) => {
    if (!e?.candidate) return;
    callerCandidatesCollection.add(e.candidate.toJSON());
  };

  subscriptions.push(
    roomRef.onSnapshot(async (snapshot) => {
      const data = snapshot.data();
      if (!peerConnection.currentRemoteDescription && data?.answer) {
        const rtcSessionDescription = new RTCSessionDescription(data?.answer);
        await peerConnection.setRemoteDescription(rtcSessionDescription);
        remoteDescriptionReady = true;

        // add the candidates when description is ready.
        if (peerCandidates.length) {
          peerCandidates.forEach((candidate) => {
            peerConnection.addIceCandidate(candidate);
          });
        }
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
            peerCandidates.push(new RTCIceCandidate(data));
          }
        }
      });
    })
  );

  return { subscriptions };
}

async function handleSetupRtcPeerConnection() {
  // create user media device
  const stream = await mediaDevices.getUserMedia({
    audio: true,
  });

  // create peer connection
  const peerConnection = new RTCPeerConnection(configuration);

  // attach user media to the peer connection
  stream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, stream);
  });

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  return {
    peerConnection,
    stream,
    offer,
  };
}

function handleGenerateSessionId() {
  return uuidv4();
}

async function handleGetRoomData(roomId) {
  try {
    const doc = await db.collection("rooms").doc(roomId).get();
    if (doc?.exists) return doc.data();
  } catch (err) {
    return undefined;
  }
}

/**
 * @param {string} userId
 * @returns {"OK" | "BUSY"}
 */
async function handleCheckReceiverCallStatus(userId) {
  const room = await handleGetRoomData(userId);

  if (room) {
    if (Date.now() > room.validTill) return "BUSY";
  }

  return "OK";
}

/**
 *
 * @param {string} userId
 */
async function handleClearRoom(userId) {
  await db.collection("rooms").doc(userId).delete();
}

/**
 * @param {string} userId
 */
async function handleCreateRoom(userId) {
  const sessionId = handleGenerateSessionId();

  await handleClearRoom(userId);

  const validTill = moment().add(15, "minutes").valueOf();

  await db.collection("rooms").doc(userId).set({
    sessionId,
    validTill,
  });
}

const configuration = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};
