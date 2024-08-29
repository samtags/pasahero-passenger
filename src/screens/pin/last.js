import { View } from "react-native";
import { useContext } from "react";
import Map from "./component/Map";
import Info from "./component/Info";
import Control from "./component/Control";
import { handleSetTransitLast } from "../transit/search/last";
import Optional from "../../components/optional";
import { Context } from "./component/Provider";

export default function PinLastLocation() {
  // const router = useRouter();
  const { selected, setSelected, isKeyboardVisible, coordinates } =
    useContext(Context);

  const { isPending, data } = coordinates;

  const handleConfirm = async () => {
    if (selected) {
      const { data } = coordinates;

      handleSetTransitLast({
        latitude: data.latitude,
        longitude: data.longitude,
        shortAddress: selected.shortAddress,
        longAddress: selected.longAddress,
      });

      // router.replace("/match/request");
      return;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ opacity: isPending ? 0 : 1 }}>
        <Map
          coordinates={[
            data?.longitude || 121.1728652,
            data?.latitude || 14.5813157,
          ]}
        />
      </View>
      <Control onSelect={setSelected} />
      <Optional condition={isKeyboardVisible === false}>
        <Info
          title={selected?.shortAddress || "Pinned Location"}
          subTitle={selected?.longAddress || "Custom pinned location."}
          onConfirm={handleConfirm}
        />
      </Optional>
    </View>
  );
}
