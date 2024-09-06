import { createContext, useState, useEffect, useRef } from "react";
import useGetCoordinates from "../../../services/queries/useGetCoordinates";
import useKeyboard from "../../../services/hooks/useKeyboard";
import useDelayedValue from "../../../services/hooks/useDelayedValue";
import useAutoComplete from "../../../services/queries/useAutoComplete";
import { extractCoordinates } from "../../../services/api/getCoordinatesByPlaceId";
import { useMMKVString } from "react-native-mmkv";
import useOnUpdate from "../../../services/hooks/useOnUpdate";
import log from "../../../services/log";
import { extractData } from "../../../services/api/getGrabCoordinatesByPlaceId";
import useGrabAutoComplete from "../../../services/queries/useGrabAutoComplete";
import useGrabMapsGetCoordinates from "../../../services/queries/useGrabMapsGetCoordinates";
import { useFeatureIsOn } from "@growthbook/growthbook-react";

export const Context = createContext({});

export default function EntryPoint(props) {
  const isGrabAutoCompleteEnabled = useFeatureIsOn("enable-grab-auto-complete", false); // prettier-ignore

  if (isGrabAutoCompleteEnabled) return <GrabPinProvider {...props} />;

  return <GoogleMapPinProvider {...props} />;
}

export function GoogleMapPinProvider({ children, latitude, longitude }) {
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
  let currentLocation = JSON.parse(currentLocationString || "{}"); // fall back pin location is the user's current location

  if (latitude && longitude) {
    currentLocation = {
      latitude,
      longitude,
    };
  }

  const [mapCoordinates, setMapCoordinates] = useState({
    latitude: 0,
    longitude: 0,
  });

  function handleSwipeMapStart() {
    setSelected();
    setIsMapAlreadyChanged(true);

    log.debug("User changed the pinned location.", { actionType: "swipe", selected }); // prettier-ignore
  }

  useEffect(() => {
    log.debug("Using Google Maps Pin Provider.");
  }, []);

  useOnUpdate(() => {
    if (q) {
      log.debug("New search query detected. Clearing the selected location.", { query: q }); // prettier-ignore
      setSelected();
    }
  }, [q]);

  useOnUpdate(() => {
    if (selected) {
      log.debug("New selected location detected. Clearing the search query.", { location: selected }); // prettier-ignore
      setQ("");
    }
  }, [selected]);

  // center map to the selected location
  useOnUpdate(() => {
    if (data?.longitude && data?.latitude) {
      log.debug("Changing the map center to the selected location.", data);

      cameraRef?.current?.setCamera({
        centerCoordinate: [data?.longitude, data?.latitude],
        animationMode: "none",
      });

      log.debug("Changing map coordinates details", data);
      setMapCoordinates({
        latitude: data?.latitude,
        longitude: data?.longitude,
      });
    }
  }, [data]);

  let displayedTitle;
  let displayedSubTitle;

  if (selected) {
    displayedTitle = selected?.shortAddress;
    displayedSubTitle = selected?.longAddress;
  } else {
    if (isMapAlreadyChanged === false) {
      displayedTitle = currentLocation?.shortAddress;
      displayedSubTitle = currentLocation?.longAddress;
    }
  }

  if (!displayedTitle) displayedTitle = "Exact location";
  if (!displayedSubTitle)
    displayedSubTitle = "Selected a custom location on the map";

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

export function GrabPinProvider({ children, latitude, longitude }) {
  const cameraRef = useRef();

  const [isMapAlreadyChanged, setIsMapAlreadyChanged] = useState(false);
  const [selected, setSelected] = useState();
  const [q, setQ] = useState("");
  const [displayedValue, setDisplayedValue] = useState("");

  const { isKeyboardVisible } = useKeyboard();
  // const { isPending, data } = useGetCoordinates(selected?.placeId);
  const { isPending, data } = useGrabMapsGetCoordinates(selected?.placeId);

  const debouncedInput = useDelayedValue(q, 750);
  // const { data: result } = useAutoComplete(debouncedInput);
  const { data: result } = useGrabAutoComplete(debouncedInput);

  // const suggestion = extractCoordinates(result);
  const suggestion = extractData(result);

  const [currentLocationString] = useMMKVString("location.current");
  let currentLocation = JSON.parse(currentLocationString || "{}"); // fall back pin location is the user's current location

  if (latitude && longitude) {
    currentLocation = {
      latitude,
      longitude,
    };
  }

  const [mapCoordinates, setMapCoordinates] = useState({
    latitude: 0,
    longitude: 0,
  });

  function handleSwipeMapStart() {
    setSelected();
    setIsMapAlreadyChanged(true);

    log.debug("User changed the pinned location.", { actionType: "swipe", selected }); // prettier-ignore
  }

  useEffect(() => {
    log.debug("Using Grab Maps Pin Provider.");
  }, []);

  useOnUpdate(() => {
    if (q) {
      log.debug("New search query detected. Clearing the selected location.", { query: q }); // prettier-ignore
      setSelected();
    }
  }, [q]);

  useOnUpdate(() => {
    if (selected) {
      log.debug("New selected location detected. Clearing the search query.", { location: selected }); // prettier-ignore
      setQ("");
    }
  }, [selected]);

  // center map to the selected location
  useOnUpdate(() => {
    if (data?.longitude && data?.latitude) {
      log.debug("Changing the map center to the selected location.", data);

      cameraRef?.current?.setCamera({
        centerCoordinate: [data?.longitude, data?.latitude],
        animationMode: "none",
      });

      log.debug("Changing map coordinates details", data);
      setMapCoordinates({
        latitude: data?.latitude,
        longitude: data?.longitude,
      });
    }
  }, [data]);

  let displayedTitle;
  let displayedSubTitle;

  if (selected) {
    displayedTitle = selected?.shortAddress;
    displayedSubTitle = selected?.longAddress;
  } else {
    if (isMapAlreadyChanged === false) {
      displayedTitle = currentLocation?.shortAddress;
      displayedSubTitle = currentLocation?.longAddress;
    }
  }

  if (!displayedTitle) displayedTitle = "Exact location";
  if (!displayedSubTitle)
    displayedSubTitle = "Selected a custom location on the map";

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
