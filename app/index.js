import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SignedIn, SignedOut, useOAuth, useUser } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";
import { useWarmUpBrowser } from "../services/hooks/useWarmUpBrowser";

WebBrowser.maybeCompleteAuthSession();

export default function Page() {
  useWarmUpBrowser();

  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const user = useUser();

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
      <View style={styles.main}>
        <Text style={styles.title}>Hello!</Text>
        <SignedIn>
          <Text style={styles.subtitle}>Welcome! {user.user.fullName}</Text>
        </SignedIn>
        <SignedOut>
          <Text style={styles.subtitle}>I'm sorry your are not signed in.</Text>
          <TouchableOpacity onPress={handleSignInViaGoogle}>
            <Text style={styles.sub}>Sign in via Google</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.sub}>Join now!</Text>
          </TouchableOpacity>
        </SignedOut>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 960,
    marginHorizontal: "auto",
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 36,
    color: "#38434D",
  },
  sub: {
    fontSize: 24,
    color: "#38434D",
    textDecorationLine: "underline",
    marginTop: 16,
  },
});
