import * as Application from 'expo-application';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const DEVICE_ID_KEY = 'cyclotron_device_id';

export const DeviceBindingService = {
  async getDeviceId(): Promise<string> {
    if (Platform.OS === 'android') {
      return Application.getAndroidId() || 'unknown-android';
    } else if (Platform.OS === 'ios') {
      const id = await Application.getIosIdForVendorAsync();
      return id || 'unknown-ios';
    } else {
      // Web Fallback
      if (Platform.OS === 'web') {
        let id = localStorage.getItem(DEVICE_ID_KEY);
        if (!id) {
           id = 'web-' + Math.random().toString(36).substring(2, 15);
           localStorage.setItem(DEVICE_ID_KEY, id);
        }
        return id;
      }
      // Native fallback if SecureStore is available but OS check failed (shouldn't happen)
      return 'unknown-device';
    }
  },

  async clearDeviceId() {
     if (Platform.OS === 'web') {
        localStorage.removeItem(DEVICE_ID_KEY);
     } else {
         // SecureStore is available on iOS and Android
        await SecureStore.deleteItemAsync(DEVICE_ID_KEY).catch(() => {});
     }
  }
};
