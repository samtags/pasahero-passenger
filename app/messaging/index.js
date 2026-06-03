import { Stack } from "expo-router";
import Messaging from "../../src/screens/messaging/[transit]";
import Setup from "../../src/screens/messaging/setup";

// todo: move this to launchdarkly
const isDebugEnabled = true;

export default function Entry(props) {
  return (
    <>
      <Stack.Screen
        options={{
          // animation: "ios",
          title: "Setup",
        }}
      />

      {(() => {
        if (isDebugEnabled) return <Setup {...props} />;
        return <Messaging {...props} />;
      })()}
    </>
  );
}
