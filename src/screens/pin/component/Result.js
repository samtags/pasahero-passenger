import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import Text from "../../../components/text";

export default function Result() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <SearchResult />
        <SearchResult />
        <SearchResult />
        <SearchResult />
        <SearchResult />
      </ScrollView>
    </View>
  );
}

export function SearchResult() {
  return (
    <TouchableOpacity>
      <View style={styles.result}>
        <Text color="#707070" size={15} weight="500">
          Salon for Herr and Frau
        </Text>
        <Text size={15} color="#707070" numberOfLines={2}>
          Unit 205, CIRQ Building, 1,1 L Sumulong Memorial Circle, Bgry San
          Roque, San Roque Antip Unit 205, CIRQ Building, 1,1 L Sumulong
          Memorial Circle, Bgry San Roque, San Roque Antip
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    borderRadius: 12,
    backgroundColor: "white",
  },
  result: {
    padding: 16,
    gap: 8,
  },
});
