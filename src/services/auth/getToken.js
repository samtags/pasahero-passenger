import AsyncStorage from "@react-native-async-storage/async-storage";

export default async function getToken(key) {
  try {
    return await AsyncStorage.getItem(key);
  } catch (err) {
    return null;
  }
}
