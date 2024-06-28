import { useMMKVString } from "react-native-mmkv";
import GettingStarted from "../src/screens/getting-started";
import Home from "../src/screens/home";
import { useBoolVariation } from "@launchdarkly/react-native-client-sdk";

import Maintenance from "../src/screens/maintenance";
import Update from "../src/screens/update";

export default function App() {
  const [location] = useMMKVString("location.current");
  const isMaintenance = useBoolVariation("php-show-maintenance", false);
  const showForceUpdate = useBoolVariation("php-show-force-update", false);

  if (!location) return <GettingStarted />;

  if (isMaintenance) return <Maintenance />;
  if (showForceUpdate) return <Update />;

  return <Home />;
}
