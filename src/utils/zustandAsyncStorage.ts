import AsyncStorage from "@react-native-async-storage/async-storage";
import { StateStorage, createJSONStorage } from "zustand/middleware";

/**
 * Custom storage for Zustand persist middleware using React Native AsyncStorage,
 * with robust error handling for all storage operations.
 * Import and use as the `storage` option in persist:
 * storage: zustandAsyncStorage
 */
const asyncStorageApi: StateStorage = {
  async getItem(name: string) {
    try {
      return await AsyncStorage.getItem(name);
    } catch (error) {
      console.error(
        `[zustandAsyncStorage] getItem error for "${name}":`,
        error
      );
      return null;
    }
  },
  async setItem(name: string, value: string) {
    try {
      await AsyncStorage.setItem(name, value);
    } catch (error) {
      console.error(
        `[zustandAsyncStorage] setItem error for "${name}":`,
        error
      );
    }
  },
  async removeItem(name: string) {
    try {
      await AsyncStorage.removeItem(name);
    } catch (error) {
      console.error(
        `[zustandAsyncStorage] removeItem error for "${name}":`,
        error
      );
    }
  },
};

export const zustandAsyncStorage = createJSONStorage(() => asyncStorageApi);
