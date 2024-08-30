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
import log from "../../services/log";
import useOnFocus from "../../services/hooks/useOnFocus";

export default function PinLastLocation() {
  const router = useRouter();
  const { isKeyboardVisible, latitude, longitude, title, subTitle } =
    useContext(Context);

  const handleConfirm = async () => {
    const payload = {
      latitude: latitude,
      longitude: longitude,
      shortAddress: title,
      longAddress: subTitle,
    };

    handleSetTransitLast(payload);

    router.navigate({
      pathname: "/transit/search/first",
      params: JSON.parse(storage.getString("location.current"), {}),
    });

    log.info("User confirmed the drop-off location.", {
      actionType: "tap",
      payload,
    });
  };

  useOnFocus(() => {
    log.debug("User is in the drop-off pin location screen.");
  });

  return (
    <View style={{ flex: 1 }}>
      <Map />
      <Control placeholder="Search drop-off location" />
      <Optional condition={isKeyboardVisible === false}>
        <Info title={title} subTitle={subTitle} onConfirm={handleConfirm} />
      </Optional>
    </View>
  );
}
