import { CameraView, Camera } from 'expo-camera';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { YStack, Text } from 'tamagui';
import * as FaceDetector from 'expo-face-detector';

interface BiometricGuardProps {
  onSecurityBreach: (breached: boolean) => void;
}

export const BiometricGuard = ({ onSecurityBreach }: BiometricGuardProps) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleFacesDetected = ({ faces }: { faces: any[] }) => {
    // If 0 faces are detected, it's a breach (User looked away or left)
    // If > 1 face is detected, it's a breach (Unauthorized viewer)
    if (faces.length === 0 || faces.length > 1) {
      onSecurityBreach(true);
    } else {
      onSecurityBreach(false);
    }
  };

  if (hasPermission === null || hasPermission === false) {
    return null; // Or a permission error UI
  }

  return (
    <View style={{ width: 1, height: 1, overflow: 'hidden', position: 'absolute', opacity: 0 }}>
      {/* 
          Hidden Camera for Face Tracking. 
          Note: On iOS/Android, the camera preview might need to be technically "visible" 
          (even if 1x1 pixel) for the stream to process frames.
      */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="front"
        onFacesDetected={handleFacesDetected}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
          runClassifications: FaceDetector.FaceDetectorClassifications.none,
          minDetectionInterval: 500, // Check every 500ms to save battery
          tracking: true,
        }}
      />
    </View>
  );
};
