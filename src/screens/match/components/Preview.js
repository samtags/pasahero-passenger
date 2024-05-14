import { FlingGestureHandler, Directions } from "react-native-gesture-handler";
import { useState } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import Optional from "../../../components/optional";

export default function Preview({
  onHandlerStateChange,
  children,
  style = {},
}) {
  const contentContainerStyle = {
    height: Dimensions.get("window").height,
    justifyContent: "flex-end",
  };

  return (
    <View style={contentContainerStyle}>
      <LayoutHandler>
        <FlingGestureHandler
          direction={Directions.UP}
          onHandlerStateChange={onHandlerStateChange}
        >
          <View style={style}>{children}</View>
        </FlingGestureHandler>
      </LayoutHandler>
    </View>
  );
}

/**
 * Use case: For a scenarios that you need to define a static height from a dynamically rendered component.
 */
function LayoutHandler({ children }) {
  const [height, setHeight] = useState();

  return (
    <>
      <View pointerEvents="none" accessible={false} style={styles.replica}>
        <View onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
          {children}
        </View>
      </View>
      <Optional condition={height}>
        <View style={{ width: "auto", height }}>{children}</View>
      </Optional>
    </>
  );
}

const styles = StyleSheet.create({
  replica: {
    position: "absolute",
    zIndex: -1000,
    left: -50000,
    opacity: 0,
  },
});
