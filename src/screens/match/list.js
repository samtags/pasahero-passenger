import { View, StyleSheet, Button, ScrollView } from "react-native";
import useMatches from "../../services/queries/useMatches";
import { router, useFocusEffect } from "expo-router";

export default function List() {
  const { data, refetch } = useMatches();

  useFocusEffect(() => {
    refetch();
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 24 }}
    >
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
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
