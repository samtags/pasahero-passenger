import { View } from "react-native";
import { useContext } from "react";
import Map from "./component/Map";
import Info from "./component/Info";
import Control from "./component/Control";
import { handleSetTransitLast } from "../transit/search/last";
import Optional from "../../components/optional";
import { Context } from "./component/Provider";
import { useRouter } from "expo-router";
import storage from "../../services/storage";
import JSON from "../../services/json";

export default function PinLastLocation() {
  const router = useRouter();
  const {
    setSelected,
    isKeyboardVisible,
    latitude,
    longitude,
    title,
    subTitle,
  } = useContext(Context);

  const handleConfirm = async () => {
    handleSetTransitLast({
      latitude: latitude,
      longitude: longitude,
      shortAddress: title,
      longAddress: subTitle,
    });

    router.navigate({
      pathname: "/transit/search/first",
      params: JSON.parse(storage.getString("location.current"), {}),
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <Map />
      <Control onSelect={setSelected} />
      <Optional condition={isKeyboardVisible === false}>
        <Info title={title} subTitle={subTitle} onConfirm={handleConfirm} />
      </Optional>
    </View>
  );
}
