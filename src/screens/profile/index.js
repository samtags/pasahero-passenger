import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Button,
} from "react-native";
import { useUser, useAuth } from "@clerk/clerk-expo";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";

export default function Profile() {
  const router = useRouter();
  const user = useUser();

  const { signOut } = useAuth();

  const handleCopyIdToClipboard = async () => {
    if (user.user.id) await Clipboard.setStringAsync(user.user.id);
  };

  function handleSignOut() {
    signOut();
    router.back();
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <Text>{user.user.fullName}</Text>
          <TouchableOpacity onPress={handleCopyIdToClipboard}>
            <Text>{user.user.id}</Text>
          </TouchableOpacity>
        </View>

        <Button onPress={handleSignOut} title="Sign Out" />
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
});
