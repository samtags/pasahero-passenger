import { useRouter, useLocalSearchParams } from "expo-router";
import { Alert, Button, View, TouchableOpacity } from "react-native";
import db from "../../services/firebase/db";
import { handleGetRoomData } from "../../services/hooks/useDial";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import Text from "../../components/text";
import { Image } from "expo-image";
import Optional from "../../components/optional";

export default function Ring() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const roomId = params?.roomId;
  const sessionId = params?.sessionId;

  const [isRejected, setIsRejected] = useState(false);

  useEffect(() => {
    if (roomId) {
      const unsubscribe = db
        .collection("rooms")
        .doc(roomId)
        .onSnapshot((doc) => {
          if (doc.exists === false) {
            setIsRejected(true);
          }
        });

      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    if (isRejected) {
      const timer = setTimeout(router.back, 1500);
      return () => clearTimeout(timer);
    }
  }, [isRejected]);

  const handleAccept = () => {
    router.replace({
      pathname: "/call/answer",
      params: {
        roomId,
      },
    });
  };

  const handleReject = async () => {
    const room = await handleGetRoomData(roomId);

    if (room.sessionId === sessionId) {
      db.collection("rooms").doc(roomId).update({
        rejected: true,
      });
    }

    setIsRejected(true);
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <LinearGradient
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          height: 280,
        }}
        colors={["#242565", "#111023"]}
        end={{ x: 1, y: 1 }}
      >
        <View
          style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
        >
          <Optional condition={isRejected === false}>
            <Text size={21} color="white">
              Driver is calling you
            </Text>
          </Optional>
          <Optional condition={isRejected === true}>
            <Text size={21} color="white">
              Call Ended
            </Text>
          </Optional>
        </View>
        <View style={{ paddingVertical: 56 }}>
          <View
            style={{ gap: 108, flexDirection: "row", justifyContent: "center" }}
          >
            <TouchableOpacity onPress={handleAccept}>
              <Image
                source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FJoin%20Call.png?alt=media&token=9c12bedb-1922-4f88-aa8f-8dda4834b183"
                style={{ width: 50, height: 50 }}
                cachePolicy="memory-disk"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleReject}>
              <Image
                source="https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2FEnd%20Call.png?alt=media&token=b8157725-8b9b-488e-8441-4d21591dd566"
                style={{ width: 50, height: 50 }}
                cachePolicy="memory-disk"
              />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
