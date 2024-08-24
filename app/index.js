import { useMMKVString } from "react-native-mmkv";
import GettingStarted from "../src/screens/getting-started";
import Home from "../src/screens/home";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { useMMKVBoolean } from "react-native-mmkv";

import Maintenance from "../src/screens/maintenance";
import Update from "../src/screens/update";

export default function App() {
  const [location] = useMMKVString("location.current");
  const [updateAvailable] = useMMKVBoolean("app.updateAvailable");
  const isMaintenance = useFeatureIsOn("php-show-maintenance", false);
  const showForceUpdate = useFeatureIsOn("php-show-force-update", false);

  if (!location) return <GettingStarted />;

  if (isMaintenance) return <Maintenance />;
  if (showForceUpdate || updateAvailable) return <Update />;

  return <Home />;
}
