import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import Text from "../../../components/text";

export default function Result({ data = [] }) {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {data?.map((item) => (
          <SearchResult
            key={item.id}
            title={item.shortAddress}
            subTitle={item.longAddress}
          />
        ))}
      </ScrollView>
    </View>
  );
}

export function SearchResult({ title, subTitle, onPress }) {
  return (
    <TouchableOpacity>
      <View style={styles.result}>
        <Text color="#707070" size={15} weight="500">
          {title}
        </Text>
        <Text size={15} color="#707070" numberOfLines={2}>
          {subTitle}
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
