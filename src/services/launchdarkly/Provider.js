// import Const from "expo-constants";
import {
  LDProvider,
  ReactNativeLDClient,
  AutoEnvAttributes,
} from "@launchdarkly/react-native-client-sdk";
import { useEffect } from "react";

const ctx = {
  kind: "user",
  key: "anonymous-key",
  debug: true,
  applicationInfo: {
    name: "com.passenger.pasahero",
    version: "1.1.0",
  },
};

const client = new ReactNativeLDClient(
  "mob-a6a22c37-7e13-4dca-9493-7929a022b949",
  AutoEnvAttributes.Disabled
);

const LaunchdarklyProvider = ({ children }) => {
  useEffect(() => {
    client.identify(ctx).catch((e) => console.log(e));
  }, []);

  return <LDProvider client={client}>{children}</LDProvider>;
};

export default LaunchdarklyProvider;
