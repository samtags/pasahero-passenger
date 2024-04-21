import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import useMatches from "../../services/queries/useMatches";
import { router } from "expo-router";

export default function List() {
  const { data } = useMatches();

  return (
    <View style={styles.container}>
      <Text style={{ fontWeight: "600" }}>Ongoing matches</Text>
      <View style={styles.spacer}>
        {data?.map((match) => (
          <TouchableOpacity
            key={match.id}
            style={styles.button}
            onPress={() => router.navigate(`/match/${match.id}`)}
          >
            <Text style={{ fontWeight: "600" }}>{match.id}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "whitesmoke",
    padding: 24,
  },

  button: {
    backgroundColor: "gainsboro",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  spacer: {
    padding: 4,
    gap: 8,
  },
});
