import { Stack } from "expo-router";
import Messaging from "../../src/screens/messaging/messaging";
import Config from "../../src/screens/messaging/config";

// todo: move this to launchdarkly
const isDebugEnabled = true;

export default function Entry(props) {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Setup",
        }}
      />

      {(() => {
        if (isDebugEnabled) return <Config {...props} />;
        return <Messaging {...props} />;
      })()}
    </>
  );
}
