import { useRouter } from "expo-router";
import db from "../firebase/db";
import { useEffect } from "react";
import storage from "../storage";
import log from "../log";

export default function useIncomingCall(userId) {
  const router = useRouter();

  useEffect(() => {
    const ref = db.collection("rooms").doc(userId);

    const unsubscribe = ref.onSnapshot(async (e) => {
      if (!e.metadata?.fromCache) {
        if (e.exists) {
          const doc = e.data();
          if (doc.showed === false && doc.offer) {
            const sessionId = doc.sessionId;

            setTimeout(async () => {
              log.debug("Received incoming call event from snapshot.");
              const handledCallSessionIds = storage.getString("app.handledCallSessionIds"); // prettier-ignore

              if (handledCallSessionIds?.includes(sessionId)) {
                log.debug("Skipping call handling because the call is already handled in the incoming call widget.", { sessionId }); // prettier-ignore
                return;
              }

              await ref.update({ showed: true });
              router.navigate({
                pathname: "/call/ring",
                params: {
                  roomId: userId,
                  sessionId,
                },
              });

              // flag the sessionId as handled
              const sessionIds = handledCallSessionIds?.split(",") || [];
              sessionIds.push(sessionId);
              storage.set("app.handledCallSessionIds", sessionIds.join(","));
            }, 3000);
          }
        }
      }
    });

    return () => unsubscribe?.();
  }, [userId]);
}
