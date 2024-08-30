import { createContext, useState, useEffect, useRef } from "react";
import useGetCoordinates from "../../../services/queries/useGetCoordinates";
import useKeyboard from "../../../services/hooks/useKeyboard";
import useDelayedValue from "../../../services/hooks/useDelayedValue";
import useAutoComplete from "../../../services/queries/useAutoComplete";
import { extractCoordinates } from "../../../services/api/getCoordinatesByPlaceId";
import { useMMKVString } from "react-native-mmkv";
import useOnUpdate from "../../../services/hooks/useOnUpdate";

export const Context = createContext({
  selected: undefined,
  setSelected: () => {},
  isKeyboardVisible: false,
  coordinates: {
    isPending: false,
    data: undefined,
  },
  q: "",
  setQ: () => {},
  displayedValue: "",
  setDisplayedValue: () => {},
});

export default function PinProvider({ children }) {
  const cameraRef = useRef();

  const [isMapAlreadyChanged, setIsMapAlreadyChanged] = useState(false);
  const [selected, setSelected] = useState();
  const [q, setQ] = useState("");
  const [displayedValue, setDisplayedValue] = useState("");

  const { isKeyboardVisible } = useKeyboard();
  const { isPending, data } = useGetCoordinates(selected?.placeId);

  const debouncedInput = useDelayedValue(q, 750);
  const { data: result } = useAutoComplete(debouncedInput);

  const suggestion = extractCoordinates(result);

  const [currentLocationString] = useMMKVString("location.current");
  const currentLocation = JSON.parse(currentLocationString || "{}");

  const [mapCoordinates, setMapCoordinates] = useState({
    latitude: 0,
    longitude: 0,
  });

  function handleSwipeMapStart() {
    setSelected();
    setIsMapAlreadyChanged(true);
  }

  useOnUpdate(() => {
    if (q) setSelected();
  }, [q]);

  useOnUpdate(() => {
    if (selected) setQ("");
  }, [selected]);

  // center map to the selected location
  useOnUpdate(() => {
    if (data?.longitude && data?.latitude) {
      cameraRef?.current?.setCamera({
        centerCoordinate: [data?.longitude, data?.latitude],
        animationMode: "none",
      });

      setMapCoordinates({
        latitude: data?.latitude,
        longitude: data?.longitude,
      });
    }
  }, [data]);

  let displayedTitle = "Exact location";
  let displayedSubTitle = "Selected a custom location on the map";

  if (selected) {
    displayedTitle = selected?.shortAddress;
    displayedSubTitle = selected?.longAddress;
  } else {
    if (isMapAlreadyChanged === false) {
      displayedTitle = currentLocation?.shortAddress;
      displayedSubTitle = currentLocation?.longAddress;
    }
  }

  const propsToPass = {
    selected,
    setSelected,
    isKeyboardVisible,
    suggestion,
    q,
    setQ,
    displayedValue,
    setDisplayedValue,
    isMapLoading: isPending,
    setMapCoordinates,
    title: displayedTitle,
    subTitle: displayedSubTitle,
    latitude: mapCoordinates.latitude || currentLocation.latitude,
    longitude: mapCoordinates.longitude || currentLocation.longitude,
    defaultLatitude: currentLocation.latitude || 0,
    defaultLongitude: currentLocation.longitude || 0,
    handleSwipeMapStart,
    cameraRef,
  };

  return <Context.Provider value={propsToPass}>{children}</Context.Provider>;
}
