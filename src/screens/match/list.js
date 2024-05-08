import { View, StyleSheet, Button } from "react-native";
import useMatches from "../../services/queries/useMatches";
import { router } from "expo-router";

export default function List() {
  const { data } = useMatches();

  return (
    <View style={styles.container}>
      <View style={styles.spacer}>
        {data?.map((match) => (
          <Button
            color="#6b7280"
            title={match.id}
            onPress={() => router.navigate(`/match/${match.id}`)}
            key={match.id}
          />
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
