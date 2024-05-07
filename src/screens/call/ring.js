import { useRouter, useLocalSearchParams } from "expo-router";
import { Button, SafeAreaView, Text, View } from "react-native";

export default function Ring() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const roomId = params?.roomId;

  const handleAccept = () => {
    router.replace({
      pathname: "/call/answer",
      params: {
        roomId,
      },
    });
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
        <Button color="#ef4444" title="Reject" onPress={router.back} />
        <Button color="#10b981" title="Answer" onPress={handleAccept} />
      </View>
    </SafeAreaView>
  );
}
