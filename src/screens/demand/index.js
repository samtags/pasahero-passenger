import { useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import UNSAFE_createDemand from "../../services/api/UNSAFE_createDemand";
import { useUser } from "@clerk/clerk-expo";

export default function Demand() {
  const router = useRouter();
  const user = useUser();

  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleCreateDemand() {
    setIsLoading(true);
    UNSAFE_createDemand(user?.user?.id)
      .then((res) => router.navigate(`/match/${res.match_id}`))
      .finally(() => setIsLoading(false));
  }

  return (
    <View style={styles.container}>
      <Text style={{ fontWeight: "600" }}>Field</Text>

      <TextInput
        autoFocus
        value={value}
        placeholder="Enter field in the future cases"
        onChangeText={setValue}
      />

      <View style={styles.spacer} />

      <TouchableOpacity disabled={isLoading} onPress={handleCreateDemand}>
        <Text style={{ fontWeight: "600" }}>Create</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "whitesmoke",
    padding: 24,
  },
  primary: {
    backgroundColor: "gainsboro",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    color: "#38434D",
    marginVertical: 16,
  },
  spacer: {
    padding: 8,
  },
});
