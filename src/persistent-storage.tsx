import AsyncStorage from "@react-native-async-storage/async-storage";
import { DeviceEventEmitter } from "react-native";

export default class PersistentStorage {
  public static async set<T>(key: string, value: T) {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    DeviceEventEmitter.emit(key);
  }

  public static async get<T = any>(key: string): Promise<T | null> {
    const item = await AsyncStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  public static onChange<T = any>(key: string, cb: (value: T | null) => any) {
    DeviceEventEmitter.addListener(
      key,
      async () => await cb(await PersistentStorage.get(key)!)
    );
  }

  public static clearListeners() {
    DeviceEventEmitter.removeAllListeners();
  }

  public static async clear() {
    for (const key of await AsyncStorage.getAllKeys()) {
      await PersistentStorage.set(key, null);
    }
  }
}
