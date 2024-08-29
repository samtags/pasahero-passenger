import { createContext, useState, useEffect } from "react";
import useGetCoordinates from "../../../services/queries/useGetCoordinates";
import useKeyboard from "../../../services/hooks/useKeyboard";
import useDelayedValue from "../../../services/hooks/useDelayedValue";
import useAutoComplete from "../../../services/queries/useAutoComplete";
import { extractCoordinates } from "../../../services/api/getCoordinatesByPlaceId";

export const Context = createContext({
  selected: undefined,
  setSelected: () => {},
  isKeyboardVisible: false,
  coordinates: {
    isPending: false,
    data: undefined,
  },
});

export default function PinProvider({ children }) {
  const [selected, setSelected] = useState();
  const [q, setQ] = useState("");
  const [displayedValue, setDisplayedValue] = useState("");

  const { isKeyboardVisible } = useKeyboard();
  const { isPending, data } = useGetCoordinates(selected?.placeId);

  const debouncedInput = useDelayedValue(q, 750);
  const { data: result } = useAutoComplete(debouncedInput);

  const suggestion = extractCoordinates(result);

  useEffect(() => {
    if (q) setSelected();
  }, [q]);

  const propsToPass = {
    selected,
    setSelected,
    isKeyboardVisible,
    coordinates: {
      isPending,
      data,
    },
    suggestion,
    q,
    setQ,
    displayedValue,
    setDisplayedValue,
  };

  return <Context.Provider value={propsToPass}>{children}</Context.Provider>;
}
