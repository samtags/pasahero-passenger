import { View, Text, SafeAreaView, StyleSheet } from "react-native";
import useWallet from "./util/useWallet";
import amount from "../../services/util/amount";
import { useUser } from "@clerk/clerk-expo";

export default function Wallet() {
  const user = useUser();
  const wallet = useWallet(user?.user?.id);

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <Text>PH Pay</Text>
        <Text style={styles.amount}>{amount.format(wallet?.balance || 0)}</Text>
      </SafeAreaView>
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
  amount: {
    fontSize: 18,
    fontWeight: "600",
  },
});
