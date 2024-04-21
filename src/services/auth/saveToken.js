import AsyncStorage from "@react-native-async-storage/async-storage";

export default async function setToken(key, value) {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (err) {
    console.error("Error while saving token:", err);
  }
}
