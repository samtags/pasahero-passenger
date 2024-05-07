import { useRouter, useLocalSearchParams } from "expo-router";
import { Button, SafeAreaView, Text, View } from "react-native";
import db from "../../services/firebase/db";
import { handleGetRoomData } from "../../services/hooks/useDial";

export default function Ring() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const roomId = params?.roomId;
  const sessionId = params?.sessionId;

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

    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, marginTop: 48 }}>
        <Text
          style={{ textAlign: "center", fontWeight: "medium", fontSize: 20 }}
        >
          Incoming Call
        </Text>
      </View>
      <View style={{ gap: 12 }}>
        <Button color="#ef4444" title="Reject" onPress={handleReject} />
        <Button color="#10b981" title="Answer" onPress={handleAccept} />
      </View>
    </SafeAreaView>
  );
}
