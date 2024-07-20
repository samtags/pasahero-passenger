import { GrowthBook, GrowthBookProvider } from "@growthbook/growthbook-react";
import { useEffect } from "react";
import log from "../log";
import { setPolyfills } from "@growthbook/growthbook";

// Create a GrowthBook instance
const gb = new GrowthBook({
  apiHost: "https://cdn.growthbook.io",
  clientKey: process.env.EXPO_PUBLIC_GB_KEY,
  enableDevMode: true,
  subscribeToChanges: true,
  streaming: true,
  attributes: {
    service: "com.pasahero",
    version: "1.0.3",
  },
  // Only required for A/B testing
  // Called every time a user is put into an experiment
  trackingCallback: (experiment, result) => {
    log.debug("Experiment Viewed", {
      experimentId: experiment.key,
      variationId: result.key,
    });
  },
});

export default function Provider({ children }) {
  useEffect(() => {
    // Configure GrowthBook to use the eventsource library
    setPolyfills({
      EventSource: require("rn-eventsource"),
    });

    gb.init({
      streaming: true,
      subscribeToChanges: true,
      timeout: 7000,
    });
  }, []);
  return <GrowthBookProvider growthbook={gb}>{children}</GrowthBookProvider>;
}
