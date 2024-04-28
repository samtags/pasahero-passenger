import AsyncStorage from "@react-native-async-storage/async-storage";
import log from "../log";

export default async function setToken(key, value) {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    log.error("Error while saving token:", { error });
  }
}
