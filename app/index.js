import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SignedOut, useOAuth } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";
import { useWarmUpBrowser } from "../src/services/hooks/useWarmUpBrowser";
import { Link } from "expo-router";

WebBrowser.maybeCompleteAuthSession();

export default function Page() {
  useWarmUpBrowser();

  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const handleSignInViaGoogle = async () => {
    try {
      const flow = await startOAuthFlow();

      const { createdSessionId, signUp, setActive } = flow;

      if (createdSessionId) {
        setActive({ session: createdSessionId });
      } else {
        setActive({ session: signUp.createdSessionId });
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.main}>
          <Link href="/locations">
            <Text style={styles.text}>Where are we going?</Text>
          </Link>
          <SignedOut>
            <TouchableOpacity onPress={handleSignInViaGoogle}>
              <Text style={styles.underlined}>Sign in via Google</Text>
            </TouchableOpacity>
          </SignedOut>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "whitesmoke",
  },
  main: {
    flex: 1,
    paddingHorizontal: 24,
  },

  underlined: {
    fontSize: 24,
    color: "#38434D",
    textDecorationLine: "underline",
    marginTop: 16,
  },
  text: {
    fontSize: 24,
    color: "#38434D",
    marginTop: 16,
  },
});
