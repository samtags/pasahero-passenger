import { useRouter } from "expo-router";
import db from "../firebase/db";
import { useEffect } from "react";

export default function useIncomingCall(userId) {
  const router = useRouter();

  useEffect(() => {
    const ref = db.collection("rooms").doc(userId);

    const unsubscribe = ref.onSnapshot(async (e) => {
      if (!e.metadata?.fromCache) {
        if (e.exists) {
          const doc = e.data();
          if (doc.showed === false && doc.offer) {
            await ref.update({ showed: true });
            setTimeout(() => {
              router.navigate({
                pathname: "/call/ring",
                params: {
                  roomId: userId,
                  sessionId: doc.sessionId,
                },
              });
            }, 3000);
          }
        }
      }
    });

    return () => unsubscribe?.();
  }, [userId]);
}
