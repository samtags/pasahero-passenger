import { Link as RNLink, useRouter } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import Text from "../../components/text";
import {
  SignedOut,
  SignedIn,
  useOAuth,
  useUser,
  useAuth,
} from "@clerk/clerk-expo";
import { handleResetApp, handleResetUser } from "../home";
import log from "../../services/log";

export default function Account() {
  const { signOut } = useAuth();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const handleSignIn = async () => {
    try {
      const flow = await startOAuthFlow();

      const { createdSessionId, signUp, setActive } = flow;

      if (createdSessionId) {
        setActive({ session: createdSessionId });
      } else {
        setActive({ session: signUp.createdSessionId });
      }
    } catch (err) {
      log.error("OAuth error", { error: err });
    }
  };

  const handleSignOut = () => {
    signOut();
    handleResetUser();
    handleResetApp();
  };

  return (
    <View style={[styles.full, { backgroundColor: "white" }]}>
      <ScrollView
        style={styles.full}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View style={styles.container}>
          <SignedIn>
            {/* <Link href="/wallet">My Wallet</Link> */}
            <Link href="/match/list">Trips</Link>
          </SignedIn>
          {/* <Link href="/account">Saved Locations</Link> */}
          <Link href="/faqs">FAQs</Link>
          {/* <Link href="/account">Privacy Policy</Link> */}
          <Link href="/feedback">Send Feedback</Link>
          <Link href="/contact-us">Contact Us</Link>
          <SignedIn>
            <Link onPress={handleSignOut} href="/account">
              Sign Out
            </Link>
          </SignedIn>
          <SignedOut>
            <Link onPress={handleSignIn} href="/account">
              Sign In
            </Link>
          </SignedOut>
        </View>
      </ScrollView>
      <View style={{ padding: 24 }}>
        <Text color="#bbbbbb">1.0.12-beta</Text>
      </View>
    </View>
  );
}

/**
 *
 * @param {ItemProps} props
 * @returns
 */
function Link({
  href,
  children,
  onPress = () => {}, //
}) {
  const router = useRouter();

  const handleOnPress = () => {
    if (href) router.navigate(href);
    onPress?.();
  };

  return (
    <View style={styles.item}>
      <TouchableOpacity onPress={handleOnPress} style={styles.link}>
        <Text size={18} color="#353579">
          {children}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * @typedef ItemProps
 *
 */

const styles = StyleSheet.create({
  link: {
    borderBottomWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderColor: "#EAEAEA",
  },
  item: { paddingHorizontal: 16 },
  full: {
    flex: 1,
  },
  container: { backgroundColor: "white", flex: 1 },
});
