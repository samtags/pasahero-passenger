import { useMMKVString } from "react-native-mmkv";
import GettingStarted from "../src/screens/getting-started";
import Home from "../src/screens/home";

export default function App() {
  const [location] = useMMKVString("location.current");

  if (!location) return <GettingStarted />;

  return <Home />;
}
