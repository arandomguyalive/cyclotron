import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../constants/firebaseConfig';
import { Platform } from 'react-native';

export const MediaService = {
  async pickMedia(type: 'image' | 'video' = 'image') {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: type === 'video' 
        ? ImagePicker.MediaTypeOptions.Videos 
        : ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      aspect: [9, 16], // Vertical video aspect ratio
    });

    if (!result.canceled) {
      return result.assets[0];
    }
    return null;
  },

  async uploadFile(uri: string, path: string): Promise<string> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, path);
      
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error("Upload failed", error);
      throw error;
    }
  }
};
