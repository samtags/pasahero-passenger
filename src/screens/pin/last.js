import Map from "./component/Map";
import Info from "./component/Info";
import Control from "./component/Control";
import { handleSetTransitLast } from "../transit/search/last";
import useKeyboard from "../../services/hooks/useKeyboard";
import Optional from "../../components/optional";
import { View } from "react-native";

export default function PinLastLocation() {
  const { isKeyboardVisible } = useKeyboard();

  const handleConfirm = () => {
    handleSetTransitLast({
      latitude: 121.1728652,
      longitude: 14.5813157,
      shortAddress: "Pinned Location",
      longAddress: "Near Salon for Herr and Frau.",
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <Map coordinates={[121.1728652, 14.5813157]} />
      <Control />
      <Optional condition={isKeyboardVisible === false}>
        <Info
          title="Pinned Location"
          subTitle="Custom pinned location. Near Salon for Herr and Frau."
          onConfirm={handleConfirm}
        />
      </Optional>
    </View>
  );
}
